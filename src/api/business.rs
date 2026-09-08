use actix_web::{HttpResponse, Responder, get, post, web};
use sea_orm::{
    ActiveModelTrait, ActiveValue, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter,
    QuerySelect, RelationTrait, TransactionTrait,
    sea_query::{ExprTrait},
};
use serde::Deserialize;
use utoipa::ToSchema;
use uuid::Uuid;

use crate::entities::{employee, partner, state, transaction, user};

#[derive(ToSchema)]
pub struct ErrorResponse {
    pub error: String,
}

#[utoipa::path(
    get,
    path = "/api/admin/partners/pending",
    responses(
        (status = 200, description = "Successfully retrieved pending partners", content_type = "application/json", body = [partner::Model]),
        (status = 500, description = "Internal server error", content_type = "application/json", body = ErrorResponse)
    )
)]
#[get("/admin/partners/pending")]
pub async fn get_pending_partners(db: web::Data<DatabaseConnection>) -> impl Responder {
    let pending_partners = partner::Entity::find()
        .join(sea_orm::JoinType::InnerJoin, partner::Relation::User.def())
        .join(sea_orm::JoinType::InnerJoin, user::Relation::State.def())
        .filter(state::Column::State.eq("waiting_activation"))
        .all(db.get_ref())
        .await;

    match pending_partners {
        Ok(partners) => HttpResponse::Ok().json(partners),
        Err(e) => {
            HttpResponse::InternalServerError().json(serde_json::json!({ "error": e.to_string() }))
        }
    }
}

// #[post("/partners/{id}/click")]
// pub async fn track_partner_click(
//     db: web::Data<DatabaseConnection>,
//     id: web::Path<Uuid>,
// ) -> impl Responder {
//     let partner_id = id.into_inner();

//     let res = partner::Entity::update_many()
//         .col_expr(
//             partner::Column::Clicks,
//             Expr::col(partner::Column::Clicks).add(1),
//         )
//         .filter(partner::Column::Id.eq(partner_id))
//         .exec(db.get_ref())
//         .await;

//     match res {
//         Ok(result) if result.rows_affected > 0 => {
//             HttpResponse::Ok().json(serde_json::json!({ "success": true }))
//         }
//         Ok(_) => HttpResponse::NotFound().json(serde_json::json!({ "error": "Partner not found" })),
//         Err(e) => {
//             HttpResponse::InternalServerError().json(serde_json::json!({ "error": e.to_string() }))
//         }
//     }
// }

#[derive(Deserialize, ToSchema)]
pub struct PaymentRequest {
    pub qr_token: String,
    pub partner_id: Uuid,
    pub amount: f32,
}

#[utoipa::path(
    post,
    path = "/api/payments",
    request_body = PaymentRequest,
    responses(
        (status = 200, description = "Successfully processed payment", content_type = "application/json", body = transaction::Model),
        (status = 400, description = "Invalid request data", content_type = "application/json", body = ErrorResponse),
        (status = 500, description = "Internal server error", content_type = "application/json", body = ErrorResponse)
    )
)]
#[post("/payments")]
pub async fn process_payment(
    db: web::Data<DatabaseConnection>,
    body: web::Json<PaymentRequest>,
) -> impl Responder {
    if body.amount <= 0.0 {
        return HttpResponse::BadRequest().json(serde_json::json!({ "error": "Invalid amount" }));
    }

    let txn_result = db
        .transaction::<_, transaction::Model, sea_orm::DbErr>(|txn| {
            Box::pin(async move {
                let emp = employee::Entity::find()
                    .filter(employee::Column::QrToken.eq(&body.qr_token))
                    .one(txn)
                    .await?
                    .ok_or_else(|| {
                        sea_orm::DbErr::Custom("Employee token not found".to_string())
                    })?;

                let current_balance = emp.balance.unwrap_or(0.0);
                if current_balance < body.amount {
                    return Err(sea_orm::DbErr::Custom("Insufficient balance".to_string()));
                }

                let mut emp_active: employee::ActiveModel = emp.clone().into();
                emp_active.balance = ActiveValue::Set(Some(current_balance - body.amount));
                emp_active.update(txn).await?;

                let now = std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap_or_default()
                    .as_secs() as i64;

                let new_tx = transaction::ActiveModel {
                    id: ActiveValue::Set(Uuid::new_v4()),
                    timestamp: ActiveValue::Set(now),
                    success: ActiveValue::Set(true),
                    value: ActiveValue::Set(body.amount),
                    partner_id: ActiveValue::Set(body.partner_id),
                    employee_id: ActiveValue::Set(emp.id),
                };

                new_tx.insert(txn).await
            })
        })
        .await;

    match txn_result {
        Ok(tx) => HttpResponse::Ok().json(tx),
        Err(sea_orm::TransactionError::Transaction(msg)) => {
            HttpResponse::BadRequest().json(serde_json::json!({ "error": msg.to_string() }))
        }
        Err(e) => {
            HttpResponse::InternalServerError().json(serde_json::json!({ "error": e.to_string() }))
        }
    }
}

#[utoipa::path(
    get,
    path = "/api/employees/{id}/transactions",
    responses(
        (status = 200, description = "Successfully retrieved transactions", content_type = "application/json", body = [transaction::Model]),
        (status = 500, description = "Internal server error", content_type = "application/json", body = ErrorResponse)
    )
)]
#[get("/employees/{id}/transactions")]
pub async fn get_employee_transactions(
    db: web::Data<DatabaseConnection>,
    id: web::Path<Uuid>,
) -> impl Responder {
    let res = transaction::Entity::find()
        .filter(transaction::Column::EmployeeId.eq(id.into_inner()))
        .all(db.get_ref())
        .await;

    match res {
        Ok(txs) => HttpResponse::Ok().json(txs),
        Err(e) => {
            HttpResponse::InternalServerError().json(serde_json::json!({ "error": e.to_string() }))
        }
    }
}

#[utoipa::path(
    get,
    path = "/api/partners/{id}/transactions",
    responses(
        (status = 200, description = "Successfully retrieved transactions", content_type = "application/json", body = [transaction::Model]),
        (status = 500, description = "Internal server error", content_type = "application/json", body = ErrorResponse)
    )
)]
#[get("/partners/{id}/transactions")]
pub async fn get_partner_transactions(
    db: web::Data<DatabaseConnection>,
    id: web::Path<Uuid>,
) -> impl Responder {
    let res = transaction::Entity::find()
        .filter(transaction::Column::PartnerId.eq(id.into_inner()))
        .all(db.get_ref())
        .await;

    match res {
        Ok(txs) => HttpResponse::Ok().json(txs),
        Err(e) => {
            HttpResponse::InternalServerError().json(serde_json::json!({ "error": e.to_string() }))
        }
    }
}

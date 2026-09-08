use crate::{
    db::{get_one, update, delete_by_id},
    entities::{user::{self as User, Role}, employee::{self as Employee},
               partner::{self as Partner}, admin::{self as Admin}, state::{self as State}},
};
use actix_web::{HttpRequest, HttpResponse, Responder, get, patch, post, delete, web};
use utoipa::{self, ToSchema};
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, IntoActiveModel, QueryFilter
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, ToSchema)]
pub struct GetResponse {
    pub id: Uuid,
    pub mail: String,
    pub name: String,
    pub role: Role,
    pub created_at: i64,
}

impl From<crate::entities::user::Model> for GetResponse {
    fn from(value: crate::entities::user::Model) -> Self {
        Self {
            id: value.id,
            mail: value.mail,
            name: value.name,
            role: value.role,
            created_at: value.created_at,
        }
    }
}

#[utoipa::path(
    get,
    path = "/api/user",
    params(
        ("Authorization" = String, Header, description = "Bearer token for authentication")
    ),
    responses(
        (status = 200, description = "User information retrieved successfully", content_type = "application/json", body = GetResponse),
        (status = 400, description = "Invalid user UUID"),
        (status = 401, description = "Unauthorized"),
        (status = 404, description = "User not found"),
        (status = 500, description = "Internal server error")
    )
)]
#[get("")]
pub async fn get(req: HttpRequest, db: web::Data<DatabaseConnection>) -> impl Responder {
    let Some(auth) = req.headers().get("Authorization") else {
        return HttpResponse::Unauthorized().finish();
    };

    let Ok(auth) = auth.to_str() else {
        return HttpResponse::Unauthorized().finish();
    };

    let Some(token) = auth.strip_prefix("Bearer ") else {
        return HttpResponse::Unauthorized().finish();
    };

    let Ok(uuid) = uuid::Uuid::parse_str(token) else {
        return HttpResponse::BadRequest().finish();
    };

    let query = User::Entity::find().filter(User::Column::Id.eq(uuid));

    match get_one(db.get_ref(), query).await {
        Ok(Some(u)) => HttpResponse::Ok().json(GetResponse::from(u)),
        Ok(None) => HttpResponse::NotFound().finish(),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

#[derive(Deserialize, ToSchema)]
pub struct PassRequest {
    pub password: String,
}

#[utoipa::path(
    post,
    path = "/api/user/pass",
    params(
        ("Authorization" = String, Header, description = "Bearer token for authentication")
    ),
    request_body = PassRequest,
    responses(
        (status = 200, description = "Password verified successfully"),
        (status = 400, description = "Invalid user UUID"),
        (status = 401, description = "Unauthorized"),
        (status = 404, description = "User not found"),
        (status = 500, description = "Internal server error")
    )
)]
#[post("/pass")]
pub async fn pass(
    req: HttpRequest,
    body: web::Json<PassRequest>,
    db: web::Data<DatabaseConnection>,
) -> impl Responder {
    let Some(auth) = req.headers().get("Authorization") else {
        return HttpResponse::Unauthorized().finish();
    };

    let Ok(auth) = auth.to_str() else {
        return HttpResponse::Unauthorized().finish();
    };

    let Some(token) = auth.strip_prefix("Bearer ") else {
        return HttpResponse::Unauthorized().finish();
    };

    let Ok(uuid) = uuid::Uuid::parse_str(token) else {
        return HttpResponse::BadRequest().finish();
    };

    let query = User::Entity::find().filter(User::Column::Id.eq(uuid));

    match get_one(db.get_ref(), query).await {
        Ok(Some(u)) => {
            if u.password == body.password {
                HttpResponse::Ok().finish()
            } else {
                HttpResponse::BadRequest().finish()
            }
        }
        Ok(None) => HttpResponse::NotFound().finish(),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

#[derive(Deserialize, ToSchema)]
pub struct PutRequest {
    pub mail: Option<String>,
    pub name: Option<String>,
    pub password: Option<String>,
}

#[utoipa::path(
    patch,
    path = "/api/user/{id}",
    params(
        ("Authorization" = String, Header, description = "Bearer token for authentication"),
    ),
    request_body = PutRequest,
    responses(
        (status = 200, description = "User information updated successfully", content_type = "application/json", body = User::Model),
        (status = 400, description = "Invalid user UUID"),
        (status = 401, description = "Unauthorized"),
        (status = 404, description = "User not found"),
        (status = 500, description = "Internal server error")
    )
)]
#[patch("")]
pub async fn put(
    req: HttpRequest,
    body: web::Json<PutRequest>,
    db: web::Data<DatabaseConnection>,
) -> impl Responder {
    let Some(auth) = req.headers().get("Authorization") else {
        return HttpResponse::Unauthorized().finish();
    };

    let Ok(auth) = auth.to_str() else {
        return HttpResponse::Unauthorized().finish();
    };

    let Some(token) = auth.strip_prefix("Bearer ") else {
        return HttpResponse::Unauthorized().finish();
    };

    let Ok(uuid) = uuid::Uuid::parse_str(token) else {
        return HttpResponse::BadRequest().finish();
    };

    let query = User::Entity::find().filter(User::Column::Id.eq(uuid));

    match get_one(db.get_ref(), query).await {
        Ok(Some(u)) => {
            let mut active_model = u.into_active_model();
            if let Some(mail) = &body.mail {
                active_model.set(
                    User::Column::Mail,
                    sea_orm::Value::String(Some(mail.to_owned())),
                );
            }
            if let Some(name) = &body.name {
                active_model.set(
                    User::Column::Name,
                    sea_orm::Value::String(Some(name.to_owned())),
                );
            }
            if let Some(password) = &body.password {
                active_model.set(
                    User::Column::Password,
                    sea_orm::Value::String(Some(password.to_owned())),
                );
            }
            match update::<User::Entity, _>(db.get_ref(), active_model).await {
                Ok(user) => HttpResponse::Ok().json(user),
                Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
            }
        }
        Ok(None) => HttpResponse::NotFound().finish(),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

#[utoipa::path(
    delete,
    path = "/api/user/delete",
    params(
        ("Authorization" = String, Header, description = "Bearer token for authentication"),
    ),
    responses(
        (status = 200, description = "User deleted successfully"),
        (status = 400, description = "Invalid user UUID"),
        (status = 401, description = "Unauthorized"),
        (status = 404, description = "User not found"),
        (status = 500, description = "Internal server error")
    )
)]
#[delete("/delete")]
pub async fn delete(
    req: HttpRequest,
    db: web::Data<DatabaseConnection>,
) -> impl Responder {
    let Some(auth) = req.headers().get("Authorization") else {
        return HttpResponse::Unauthorized().finish();
    };

    let Ok(auth) = auth.to_str() else {
        return HttpResponse::Unauthorized().finish();
    };

    let Some(token) = auth.strip_prefix("Bearer ") else {
        return HttpResponse::Unauthorized().finish();
    };

    let Ok(uuid) = uuid::Uuid::parse_str(token) else {
        return HttpResponse::BadRequest().finish();
    };

    let query = User::Entity::find().filter(User::Column::Id.eq(uuid));

    match get_one(db.get_ref(), query).await {
        Ok(Some(u)) => {
            let delete_record = match GetResponse::from(u.clone()).role {
                Role::Manant => delete_by_id::<Employee::Entity, _>(db.get_ref(), u.id).await,
                Role::Partner => delete_by_id::<Partner::Entity, _>(db.get_ref(), u.id).await,
                Role::Admin => delete_by_id::<Admin::Entity, _>(db.get_ref(), u.id).await,
            };

            if let Err(e) = delete_record {
                return HttpResponse::InternalServerError().body(e.to_string());
            }
            if let Err(e) = delete_by_id::<State::Entity, _>(db.get_ref(), u.id).await
            {
                return HttpResponse::InternalServerError().body(e.to_string());
            }
            match delete_by_id::<User::Entity, _>(db.get_ref(), u.id).await {
                Ok(_) => HttpResponse::Ok().finish(),
                Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
            }
        }
        Ok(None) => HttpResponse::NotFound().finish(),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/user")
            .service(get)
            .service(pass)
            .service(put)
            .service(delete)
    );
}

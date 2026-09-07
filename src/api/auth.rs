use crate::{
    db::{get_one, insert},
    entities::user::{self as User},
    models::Role,
};
use utoipa::{self, ToSchema};
use actix_web::{HttpResponse, Responder, post, web};
use sea_orm::{ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Deserialize, ToSchema)]
pub struct LoginRequest {
    pub mail: String,
    pub password: String,
}

#[derive(Serialize, ToSchema)]
pub struct AuthResponse {
    pub id: Uuid,
    pub mail: String,
    pub name: String,
    pub role: Role,
}

#[utoipa::path(
    post,
    path = "/api/login",
    request_body = LoginRequest,
    responses(
        (status = 200, description = "Successfully authenticated", content_type = "application/json", body = AuthResponse),
        (status = 401, description = "Invalid email or password"),
        (status = 500, description = "Internal server error")
    )
)]
#[post("/login")]
pub async fn login(
    body: web::Json<LoginRequest>,
    db: web::Data<DatabaseConnection>,
) -> impl Responder {
    let query = User::Entity::find().filter(User::Column::Mail.eq(&body.mail));

    match get_one(&**db, query).await {
        Ok(Some(user)) => {
            if user.password != body.password {
                return HttpResponse::Unauthorized().body("Wrong password.");
            }
            HttpResponse::Ok().json(AuthResponse {
                id: user.id,
                mail: user.mail.clone(),
                name: user.name.clone(),
                role: user.role.into(),
            })
        }
        Ok(None) => HttpResponse::Unauthorized().finish(),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

#[derive(Deserialize, ToSchema)]
pub struct RegisterRequest {
    pub mail: String,
    pub name: String,
    pub password: String,
    pub role: Role,
}

#[utoipa::path(
    post,
    path = "/api/register",
    request_body = RegisterRequest,
    responses(
        (status = 200, description = "Successfully registered", content_type = "application/json", body = AuthResponse),
        (status = 400, description = "Invalid role or request data"),
        (status = 401, description = "Invalid email or password"),
        (status = 409, description = "Email already in use"),
        (status = 500, description = "Internal server error")
    )
)]
#[post("/register")]
pub async fn register(
    body: web::Json<RegisterRequest>,
    db: web::Data<DatabaseConnection>,
) -> impl Responder {
    let query = User::Entity::find().filter(User::Column::Mail.eq(&body.mail));

    match get_one(db.get_ref(), query).await {
        Ok(Some(_)) => return HttpResponse::Conflict().finish(),
        Ok(None) => {}
        Err(e) => return HttpResponse::InternalServerError().body(e.to_string()),
    }

    let role = match body.role {
        Role::Admin => return HttpResponse::BadRequest().body("Wrong role."),
        r => r,
    };

    let user = match crate::models::User::new(
        body.mail.clone(),
        body.name.clone(),
        body.password.clone(),
        role,
    ) {
        Ok(user) => user,
        Err(e) => {
            return HttpResponse::InternalServerError().body(e.to_string());
        }
    };

    let entity = User::ActiveModel::from(User::Model::from(user));

    match insert::<User::Entity, _>(db.get_ref(), entity).await {
        Ok(user) => HttpResponse::Ok().json(AuthResponse {
            id: user.id,
            mail: user.mail,
            name: user.name,
            role: user.role.into(),
        }),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(web::scope("/auth").service(login).service(register));
}

use actix_web::web;
use crate::{
    models::{Role}
};
use utoipa::OpenApi;

mod auth;
mod crud;
mod echo;
mod health;
mod resources;
mod user;
mod csv;
mod docs;
mod users;

use crate::entities::{admin, employee, partner, state};
use resources::*;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api")
            .service(health::health)
            .service(echo::echo)
            .service(csv::transactions_to_csv)
            .configure(user::configure)
            .configure(auth::configure)
            .configure(docs::configure)
            .service(crud::crud_scope::<employee::Entity, EmployeeAdapter>(
                "/employees",
            ))
            .service(crud::crud_scope::<partner::Entity, PartnerAdapter>(
                "/partners",
            ))
            .service(crud::crud_scope::<state::Entity, StateAdapter>("/states"))
            .service(crud::crud_scope::<admin::Entity, AdminAdapter>("/admins")),
    );
}

#[derive(OpenApi)]
#[openapi(
    paths(
        health::health,
        echo::echo,
        csv::transactions_to_csv,
        user::get,
        user::pass,
        user::put,
        user::delete,
        auth::login,
        auth::register,
    ),
    components(
        schemas(
            Role,
            user::GetResponse, user::PassRequest, user::PutRequest,
            auth::LoginRequest, auth::RegisterRequest, auth::AuthResponse,
        )
    )
)]
pub struct ApiDoc;

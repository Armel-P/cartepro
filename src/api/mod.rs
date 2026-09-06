use actix_web::web;

mod auth;
mod crud;
mod csv;
mod echo;
mod health;
mod resources;
mod user;
mod users;

use crate::entities::{admin, employee, partner, state};
use resources::*;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api")
            .service(health::health)
            .service(echo::echo)
            .service(user::get)
            .service(user::pass)
            .service(user::put)
            .service(csv::transactions_to_csv)
            .configure(auth::configure)
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

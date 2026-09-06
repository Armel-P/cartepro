use crate::db;
use actix_web::{HttpResponse, Responder, Scope, web};
use sea_orm::{
    ActiveModelTrait, DatabaseConnection, EntityTrait, IntoActiveModel, PrimaryKeyTrait,
};
use serde::{Serialize, de::DeserializeOwned};

pub trait CrudAdapter<E: EntityTrait>: Send + Sync + 'static {
    type CreateDto: DeserializeOwned + Send + 'static;
    type UpdateDto: DeserializeOwned + Send + 'static;

    fn to_active_model(dto: Self::CreateDto) -> E::ActiveModel;
    fn apply_update(dto: Self::UpdateDto, model: E::Model) -> E::ActiveModel;
}

pub async fn get_all<E, A>(db: web::Data<DatabaseConnection>) -> impl Responder
where
    E: EntityTrait,
    E::Model: Serialize,
    A: CrudAdapter<E>,
{
    match db::get_all::<E, _>(db.get_ref()).await {
        Ok(items) => HttpResponse::Ok().json(items),
        Err(e) => {
            HttpResponse::InternalServerError().json(serde_json::json!({ "error": e.to_string() }))
        }
    }
}

pub async fn get_by_id<E, A>(
    db: web::Data<DatabaseConnection>,
    id: web::Path<<<E as EntityTrait>::PrimaryKey as PrimaryKeyTrait>::ValueType>,
) -> impl Responder
where
    E: EntityTrait,
    E::Model: Serialize,
    <<E as EntityTrait>::PrimaryKey as PrimaryKeyTrait>::ValueType:
        DeserializeOwned + Clone + Send + Sync,
    A: CrudAdapter<E>,
{
    match db::get_by_id::<E, _>(db.get_ref(), id.into_inner()).await {
        Ok(Some(item)) => HttpResponse::Ok().json(item),
        Ok(None) => HttpResponse::NotFound().json(serde_json::json!({ "error": "Not found" })),
        Err(e) => {
            HttpResponse::InternalServerError().json(serde_json::json!({ "error": e.to_string() }))
        }
    }
}

pub async fn create<E, A>(
    db: web::Data<DatabaseConnection>,
    body: web::Json<A::CreateDto>,
) -> impl Responder
where
    E: EntityTrait,
    E::Model: Serialize + IntoActiveModel<E::ActiveModel>,
    E::ActiveModel: ActiveModelTrait<Entity = E> + Send,
    A: CrudAdapter<E>,
{
    let model = A::to_active_model(body.into_inner());
    match db::insert::<E, _>(db.get_ref(), model).await {
        Ok(item) => HttpResponse::Created().json(item),
        Err(e) => {
            HttpResponse::InternalServerError().json(serde_json::json!({ "error": e.to_string() }))
        }
    }
}

pub async fn update<E, A>(
    db: web::Data<DatabaseConnection>,
    id: web::Path<<<E as EntityTrait>::PrimaryKey as PrimaryKeyTrait>::ValueType>,
    body: web::Json<A::UpdateDto>,
) -> impl Responder
where
    E: EntityTrait,
    E::Model: Serialize + IntoActiveModel<E::ActiveModel>,
    E::ActiveModel: ActiveModelTrait<Entity = E> + Send,
    <<E as EntityTrait>::PrimaryKey as PrimaryKeyTrait>::ValueType:
        DeserializeOwned + Clone + Send + Sync,
    A: CrudAdapter<E>,
{
    match db::get_by_id::<E, _>(db.get_ref(), id.into_inner()).await {
        Ok(Some(existing)) => {
            let updated_model = A::apply_update(body.into_inner(), existing);
            match db::update::<E, _>(db.get_ref(), updated_model).await {
                Ok(item) => HttpResponse::Ok().json(item),
                Err(e) => HttpResponse::InternalServerError()
                    .json(serde_json::json!({ "error": e.to_string() })),
            }
        }
        Ok(None) => HttpResponse::NotFound().json(serde_json::json!({ "error": "Not found" })),
        Err(e) => {
            HttpResponse::InternalServerError().json(serde_json::json!({ "error": e.to_string() }))
        }
    }
}

pub async fn delete<E, A>(
    db: web::Data<DatabaseConnection>,
    id: web::Path<<<E as EntityTrait>::PrimaryKey as PrimaryKeyTrait>::ValueType>,
) -> impl Responder
where
    E: EntityTrait,
    <<E as EntityTrait>::PrimaryKey as PrimaryKeyTrait>::ValueType:
        DeserializeOwned + Clone + Send + Sync,
    A: CrudAdapter<E>,
{
    match db::delete_by_id::<E, _>(db.get_ref(), id.into_inner()).await {
        Ok(res) if res.rows_affected > 0 => HttpResponse::NoContent().finish(),
        Ok(_) => HttpResponse::NotFound().json(serde_json::json!({ "error": "Not found" })),
        Err(e) => {
            HttpResponse::InternalServerError().json(serde_json::json!({ "error": e.to_string() }))
        }
    }
}

pub fn crud_scope<E, A>(path: &str) -> Scope
where
    E: EntityTrait + 'static,
    E::Model: Serialize + IntoActiveModel<E::ActiveModel>,
    E::ActiveModel: ActiveModelTrait<Entity = E> + Send,
    <<E as EntityTrait>::PrimaryKey as PrimaryKeyTrait>::ValueType:
        DeserializeOwned + Clone + Send + Sync + 'static,
    A: CrudAdapter<E> + 'static,
{
    web::scope(path)
        .service(
            web::resource("")
                .route(web::get().to(get_all::<E, A>))
                .route(web::post().to(create::<E, A>)),
        )
        .service(
            web::resource("/{id}")
                .route(web::get().to(get_by_id::<E, A>))
                .route(web::put().to(update::<E, A>))
                .route(web::delete().to(delete::<E, A>)),
        )
}

use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use sqlx::postgres::{PgPool, PgPoolOptions};
use std::env;
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;

#[derive(Serialize, Deserialize)]
struct HealthResponse {
    status: String,
    database: String,
}

#[derive(Serialize, Deserialize, sqlx::FromRow)]
struct EquityBhavcopy {
    #[serde(rename = "SYMBOL")]
    symbol: String,
    #[serde(rename = "SERIES")]
    series: String,
    #[serde(rename = "OPEN")]
    open: f64,
    #[serde(rename = "HIGH")]
    high: f64,
    #[serde(rename = "LOW")]
    low: f64,
    #[serde(rename = "CLOSE")]
    close: f64,
    #[serde(rename = "LAST")]
    last: f64,
    #[serde(rename = "PREVCLOSE")]
    prevclose: f64,
    #[serde(rename = "TOTTRDQTY")]
    tottrdqty: i64,
    #[serde(rename = "TOTTRDVAL")]
    tottrdval: f64,
    #[serde(rename = "TIMESTAMP")]
    timestamp: String,
    #[serde(rename = "TOTALTRADES")]
    totaltrades: i64,
    #[serde(rename = "ISIN")]
    isin: String,
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Failed to create pool");

    let app = Router::new()
        .route("/health", get(health_check))
        .route("/api/market-data", get(get_all_data))
        .route("/api/market-data/:symbol", get(get_symbol_data))
        .layer(CorsLayer::permissive())
        .with_state(pool);

    let port = env::var("SERVICE_PORT").unwrap_or_else(|_| "8001".to_string());
    let addr: SocketAddr = format!("0.0.0.0:{}", port).parse().expect("Invalid address");
    println!("listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn health_check(State(pool): State<PgPool>) -> impl IntoResponse {
    match sqlx::query("SELECT 1").execute(&pool).await {
        Ok(_) => (
            StatusCode::OK,
            Json(HealthResponse {
                status: "healthy".to_string(),
                database: "connected".to_string(),
            }),
        ),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(HealthResponse {
                status: "unhealthy".to_string(),
                database: format!("error: {}", e),
            }),
        ),
    }
}

async fn get_all_data(State(pool): State<PgPool>) -> impl IntoResponse {
    let result = sqlx::query_as::<_, EquityBhavcopy>("SELECT * FROM equity_bhavcopy LIMIT 100")
        .fetch_all(&pool)
        .await;

    match result {
        Ok(data) => (StatusCode::OK, Json(data)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, format!("Database error: {}", e)).into_response(),
    }
}

async fn get_symbol_data(
    State(pool): State<PgPool>,
    Path(symbol): Path<String>,
) -> impl IntoResponse {
    let result: Result<Option<EquityBhavcopy>, sqlx::Error> = sqlx::query_as::<_, EquityBhavcopy>("SELECT * FROM equity_bhavcopy WHERE \"SYMBOL\" = $1")
        .bind(symbol.to_uppercase())
        .fetch_optional(&pool)
        .await;

    match result {
        Ok(Some(data)) => (StatusCode::OK, Json(data)).into_response(),
        Ok(None) => (StatusCode::NOT_FOUND, "Symbol not found").into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, format!("Database error: {}", e)).into_response(),
    }
}

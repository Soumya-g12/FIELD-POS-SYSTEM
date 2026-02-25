# Azure infrastructure for POS system
provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "pos_rg" {
  name     = "field-service-pos"
  location = "East US"
}

# PostgreSQL database
resource "azurerm_postgresql_server" "pos_db" {
  name                = "field-service-db"
  location            = azurerm_resource_group.pos_rg.location
  resource_group_name = azurerm_resource_group.pos_rg.name

  sku_name = "B_Gen5_2"

  storage_mb                   = 5120
  backup_retention_days        = 7
  geo_redundant_backup_enabled = false
  auto_grow_enabled            = true

  administrator_login          = "posadmin"
  administrator_login_password = var.db_password
  version                      = "11"
  ssl_enforcement_enabled      = true
}

# Azure Functions for API
resource "azurerm_function_app" "pos_api" {
  name                       = "field-service-api"
  location                   = azurerm_resource_group.pos_rg.location
  resource_group_name        = azurerm_resource_group.pos_rg.name
  app_service_plan_id        = azurerm_app_service_plan.pos_plan.id
  storage_account_name       = azurerm_storage_account.pos_storage.name
  storage_account_access_key = azurerm_storage_account.pos_storage.primary_access_key

  app_settings = {
    "DATABASE_URL" = "postgresql://${azurerm_postgresql_server.pos_db.administrator_login}@${azurerm_postgresql_server.pos_db.name}:${var.db_password}@${azurerm_postgresql_server.pos_db.fqdn}:5432/postgres"
    "SALESFORCE_CLIENT_ID"     = var.salesforce_client_id
    "SALESFORCE_CLIENT_SECRET" = var.salesforce_client_secret
  }
}

# Storage for media (Cloudflare R2 compatible)
resource "azurerm_storage_account" "pos_storage" {
  name                     = "fieldservicefiles"
  resource_group_name      = azurerm_resource_group.pos_rg.name
  location                 = azurerm_resource_group.pos_rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

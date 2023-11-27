use log::{error, info};
use serde::Deserialize;
use std::collections::BTreeMap;

#[derive(Deserialize)]
struct Service {
    id: u32,
    urls: Vec<String>,
}

#[derive(Deserialize)]
struct Page {
    // total: u32,
    // current: u32,
    // start: u32,
    end: u32,
}

#[derive(Deserialize)]
struct Params {
    _page: Page,
    services: Vec<Service>,
}

#[derive(Deserialize)]
struct TosDrResponse {
    // error: u32,
    // message: String,
    parameters: Params,
}

fn main() {
    env_logger::init();

    let mut mapping = BTreeMap::new();

    let mut current_page = 1;
    let mut max_page = 0;
    loop {
        info!("Fetching page #{} / {}", current_page, max_page);

        match reqwest::blocking::get(format!(
            "https://api.tosdr.org/service/v1/?page={}",
            current_page
        )) {
            Ok(response) => {
                let json = response.text().unwrap_or("{}".into());
                let obj: TosDrResponse = serde_json::from_str(&json).unwrap();

                info!("Found {} services", obj.parameters.services.len());
                for service in obj.parameters.services {
                    for url in service.urls {
                        mapping.insert(url.trim().to_owned(), service.id);
                    }
                }
                max_page = obj.parameters._page.end;
            }
            Err(err) => error!("Failed to fetch data: {}", err),
        }

        current_page += 1;

        if current_page > max_page {
            break;
        }
    }

    let json = serde_json::to_string(&mapping).unwrap();
    println!("{}", json);
}

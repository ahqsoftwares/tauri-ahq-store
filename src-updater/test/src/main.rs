use updater::*;

#[tokio::main]
async fn main() {
    let (yes, value) = is_update_available("", false).await;

    println!("{}", &yes);
    if yes {
        println!("Updating");
        let value = value.unwrap();
        update(value).await;
    }
}
use chalk_rs::Chalk;
use lazy_static::lazy_static;

lazy_static! {
  pub static ref INFO: String = {
    let mut chalk = Chalk::new();
    chalk.blue().bold().string(&"  INFO: ")
  };
  pub static ref WARN: String = {
    let mut chalk = Chalk::new();
    chalk.yellow().bold().string(&"  WARN: ")
  };
  pub static ref ERROR: String = {
    let mut chalk = Chalk::new();
    chalk.red().bold().string(&"   ERR: ")
  };
}

pub fn info(msg: &str) {
  println!("{}{}", INFO.as_str(), msg);
}

pub fn warn(msg: &str) {
  println!("{}{}", WARN.as_str(), msg);
}

pub fn error(msg: &str) {
  println!("{}{}", ERROR.as_str(), msg);
}

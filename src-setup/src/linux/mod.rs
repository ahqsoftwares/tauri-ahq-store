mod sudo;

pub fn main() {
    println!("Linux version of installer");
    let err = sudo::install_package("/home/ahqsoftwares/Downloads/astore.deb".into()).is_none();
}
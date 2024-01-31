use std::{io::{Read, Write}, thread, time::Duration};

use interprocess::local_socket::LocalSocketStream;

fn main() {
    let mut stream = LocalSocketStream::connect("/ahqstore/service_logger").unwrap();
    let _ = stream.set_nonblocking(true);

    loop {
        let _ = stream.write(b"Hello World").unwrap();
        let _ = stream.flush().unwrap();

        let mut stri = String::new();
        loop {
            if let Err(_) = stream.read_to_string(&mut stri) {
                break
            }
        }

        println!("{stri}");

        thread::sleep(Duration::from_secs(5));
    }
}

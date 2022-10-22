use std::fs::File;
use std::path::Path;
use std::{fs, io};
use std::process::Command;
use zip;

pub fn extract(path: &Path, location: &Path) -> i32 {
         let args: (&Path, &Path) = (path, location);
         print!("{} {}", args.0.to_string_lossy(), args.1.to_string_lossy());

         let file = fs::File::open(&args.0).unwrap();

         let mut archive = zip::ZipArchive::new(file).unwrap();

         for i in 0..archive.len() {
                  let mut file = archive.by_index(i).unwrap();

                  let outpath = match file.enclosed_name() {
                           Some(path) => Path::join(location, path),
                           None => continue,
                  };

                  {
                           let comment = file.comment();
                           if !comment.is_empty() {
                                    println!("File {} comment: {}", i, comment);
                           }
                  }

                  if (*file.name()).ends_with("/") {
                           println!("File {} extracted to {}", i, outpath.display());
                  } else {
                           println!("File {} extracted to {}",
                           i,
                           outpath.display());

                           if let Some(p) = outpath.parent() {
                                    if !p.exists() {
                                             match fs::create_dir_all(&p) {
                                                      Ok(_) => {},
                                                      Err(_) => {return 1}
                                             };
                                    }
                           }
                           let mut outfile: File;
                           match fs::File::create(&outpath) {
                                    Ok(file) => {outfile = file},
                                    Err(_) => {return 1}
                           };
                           match io::copy(&mut file, &mut outfile) {
                                    Ok(_) => {},
                                    Err(_) => {return 1}
                           }
                  }
         }
         return 0;
}

pub fn run(path: String) -> bool {
         let mut child = Command::new(path).spawn().expect("Failed");
         let ecode = child.wait().expect("Failed!");
         println!("{}", ecode.to_string());
         return ecode.success();
}
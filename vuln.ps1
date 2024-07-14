$dirs = Get-ChildItem -Attributes Directory -Filter src-*

foreach ($dir in $dirs) {
  cd $dir
  cargo audit
  cd ..
}
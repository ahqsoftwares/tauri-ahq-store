$commitMessage = Read-Host "Enter a commit message"

$files = Get-ChildItem src-tauri/src -Recurse -File

foreach ($file in $files) {
    git add $file.FullName

    $relativePath = $file.FullName.Substring($rootDirectory.Length + 1)
    $cmtMessage = $commitMessage + '\n' + "Add $relativePath"
    git commit -m $cmtMessage
}

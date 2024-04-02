$commitMessage = Read-Host "Enter a commit message"

$files = Get-ChildItem src-service-old\src -Recurse -File

foreach ($file in $files) {
    Write-Host $file.FullName

    $result = Select-String $file.FullName -Pattern "target"
    if ($result -ne $null) {
    } else {
        $result = Select-String $file.FullName -Pattern "node_modules"

        if ($result -ne $null) {

        } else {
            Write-Host "Agreed $file.FullName"

            git add $file.FullName

            $relativePath = $file.FullName.Substring($rootDirectory.Length + 1)
            $cmtMessage = $commitMessage + "
            Add $relativePath"
            git commit -m $cmtMessage
        }
    }
}

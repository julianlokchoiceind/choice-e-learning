<#
.SYNOPSIS
Component Dependency Analyzer

.DESCRIPTION
This script helps identify dependencies between components to prevent breaking changes
when removing files.

.PARAMETER ComponentPath
Path to the component you want to analyze

.EXAMPLE
.\scripts\analyze-dependencies.ps1 -ComponentPath "src\components\CounterComponent.tsx"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$ComponentPath
)

# Configuration
$RootDir = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$SrcDir = Join-Path -Path $RootDir -ChildPath "src"

# Get component name from path
$ComponentName = [System.IO.Path]::GetFileNameWithoutExtension($ComponentPath)

Write-Host "`n🔍 Analyzing dependencies for component: $ComponentName`n" -ForegroundColor Cyan

# Find all imports of the component
function Find-Imports {
    Write-Host "Files importing this component:" -ForegroundColor Yellow
    Write-Host "-----------------------------" -ForegroundColor Yellow
    
    $files = @()
    $pattern = "import.*$ComponentName"
    
    # Search for imports in all TypeScript/JavaScript files
    $importFiles = Get-ChildItem -Path $SrcDir -Recurse -Include "*.tsx","*.jsx","*.ts","*.js" | 
                  Select-String -Pattern $pattern |
                  Where-Object { $_.Path -ne $ComponentPath }
    
    if (-not $importFiles -or $importFiles.Count -eq 0) {
        Write-Host "No imports found. This component may be unused."
        return @()
    }
    
    foreach ($match in $importFiles) {
        $file = $match.Path
        $importStatement = $match.Line.Trim()
        
        Write-Host "- $file" -ForegroundColor Green
        Write-Host "  $importStatement`n"
        
        $files += @{
            File = $file
            ImportStatement = $importStatement
        }
    }
    
    return $files
}

# Check for usage beyond imports (JSX tags, function calls)
function Find-Usages {
    param (
        [Parameter(Mandatory=$true)]
        [array]$Files
    )
    
    if ($Files.Count -eq 0) { return }
    
    Write-Host "Component usage analysis:" -ForegroundColor Yellow
    Write-Host "------------------------" -ForegroundColor Yellow
    
    foreach ($fileInfo in $Files) {
        $file = $fileInfo.File
        
        try {
            $content = Get-Content -Path $file -Raw
            
            # Match JSX tags or function calls
            $jsxPattern = "<$ComponentName[\s/>]"
            $funcPattern = "$ComponentName\("
            
            $jsxMatches = [regex]::Matches($content, $jsxPattern)
            $funcMatches = [regex]::Matches($content, $funcPattern)
            $allMatches = $jsxMatches + $funcMatches
            
            Write-Host "- $file`: $($allMatches.Count) usage(s)" -ForegroundColor Green
            
            if ($allMatches.Count -gt 0) {
                foreach ($match in $allMatches) {
                    $index = $match.Index
                    $contentBeforeMatch = $content.Substring(0, $index)
                    $lineNumber = ($contentBeforeMatch -split "`n").Length
                    
                    # Get context lines
                    $allLines = $content -split "`n"
                    $startLine = [Math]::Max(0, $lineNumber - 4)
                    $endLine = [Math]::Min($allLines.Length - 1, $lineNumber + 2)
                    
                    Write-Host "  Usage at line $lineNumber`:" -ForegroundColor Cyan
                    
                    for ($i = $startLine; $i -le $endLine; $i++) {
                        $currentLine = $i + 1
                        $marker = if ($currentLine -eq $lineNumber) { "> " } else { "  " }
                        Write-Host "  $marker$currentLine`: $($allLines[$i].Trim())"
                    }
                    
                    Write-Host ""
                }
            }
        }
        catch {
            Write-Host "  Error analyzing $file`: $_" -ForegroundColor Red
        }
    }
}

# Run the analysis
$importingFiles = Find-Imports
Find-Usages -Files $importingFiles

Write-Host "`n✅ Dependency analysis complete for $ComponentName`n" -ForegroundColor Green
Write-Host "Recommendation:" -ForegroundColor Yellow
Write-Host "--------------" -ForegroundColor Yellow

if ($importingFiles.Count -eq 0) {
    Write-Host "This component appears to be unused and can likely be safely removed."
}
else {
    Write-Host "Before removing this component, update the following files to remove dependencies:"
    foreach ($fileInfo in $importingFiles) {
        Write-Host "- $($fileInfo.File)" -ForegroundColor Cyan
    }
}

Write-Host "`nSafety Checklist:" -ForegroundColor Yellow
Write-Host "---------------" -ForegroundColor Yellow
Write-Host "☐ Remove all imports of the component"
Write-Host "☐ Replace component usage with alternatives"
Write-Host "☐ Run build to verify no errors"
Write-Host "☐ Then remove the component file" 
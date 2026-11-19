# SAS consolidated release-candidate checks — no deployment, git merge or database mutations.
# Run in PowerShell 7: pwsh -File scripts/verify-briefing-release.ps1
$ErrorActionPreference = 'Stop'
Set-Location (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
if (-not (Test-Path 'package.json')) { throw 'تعذر تحديد جذر مشروع ساس' }
$branch = (git branch --show-current).Trim()
$allowed = @('integration/sas-briefing-studio-rc-2026-11-18', 'feat/visual-knowledge-yemen-timeline-v1')
if ($LASTEXITCODE -ne 0 -or $branch -notin $allowed) { throw "شغل الاختبار على فرع التطوير المعتمد، وليس على main: $branch" }
$log = Join-Path $env:TEMP ('SAS-briefing-release-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.log')
Start-Transcript -Path $log | Out-Null
try {
  Write-Host '=== 1/3: Automated briefing and studio regressions ===' -ForegroundColor Cyan
  & node --experimental-strip-types --test scripts/check-briefing-scope-package1.mjs scripts/check-briefing-to-studio-package2.mjs scripts/check-briefing-official-card-package3.mjs scripts/check-briefing-overview.mjs scripts/check-briefing-fx-context.mjs scripts/check-visual-knowledge-timeline.mjs
  if ($LASTEXITCODE -ne 0) { throw 'فشلت اختبارات الحزم أو مؤشرات الإحاطة' }
  Write-Host '=== 2/3: TypeScript check ===' -ForegroundColor Cyan
  & npm run typecheck
  if ($LASTEXITCODE -ne 0) { throw 'فشل TypeScript' }
  Write-Host '=== 3/3: Production build ===' -ForegroundColor Cyan
  & npm run build
  if ($LASTEXITCODE -ne 0) { throw 'فشل بناء Next.js' }
  Write-Host '=== PASS: all automated checks completed ===' -ForegroundColor Green
  Write-Host 'يلزم اختبار المتصفح وتصدير PNG يدويًا قبل اعتماد الإصدار.'
} finally {
  Stop-Transcript | Out-Null
  Write-Host "Result log: $log"
}

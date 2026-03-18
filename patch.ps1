$file = "trainer_pro.html"
$enc  = [System.Text.UTF8Encoding]::new($false)   # UTF-8 no BOM
$lines = [System.IO.File]::ReadAllLines($file, $enc)

# ── 1. Replace quiz questions ────────────────────────────────────────────────
$qStart = 0..($lines.Length-1) | Where-Object { $lines[$_] -match "const finalQuizQuestions = \[" } | Select-Object -First 1
$qEnd   = ($qStart+1)..($lines.Length-1) | Where-Object { $lines[$_].Trim() -eq "];" } | Select-Object -First 1
$newQ = @(
  "const finalQuizQuestions = [",
  "  {q:'What is the minimum recommended Reaction Gap when approaching a standing agitated patient?', a:['2-3 feet - within coaching range','6-10 feet - outside striking range','15+ feet - hallway distance'], correct:1},",
  "  {q:'Marcus says he is sick of waiting. What is the BEST first response?', a:['Tell him the wait is normal and he needs to be patient','Validate: That wait sounds incredibly frustrating - I hear you.','Inform him of consequences for outbursts'], correct:1},",
  "  {q:'Which object in a psychiatric room is a ligature risk?', a:['A plastic chair','A window blind cord','A foam mattress'], correct:1},",
  "  {q:'Which micro-expression most reliably precedes a physical strike from an agitated patient?', a:['Tearful eyes and lip tremor','Flared nostrils, clenched jaw, and narrowed eyes','Downcast gaze and collapsed posture'], correct:1},",
  "  {q:'Choice Architecture in de-escalation means:', a:['Physically blocking escape routes','Offering two safe options so the patient feels in control','Designing the unit layout to prevent elopement'], correct:1},",
  "  {q:'Offering Marcus a choice between two safe options is a form of manipulation - True or False?', a:['True - it removes his autonomy','False - it IS Choice Architecture and restores his sense of control','Only true if the patient is involuntary'], correct:1},",
  "  {q:'The CPI model pillars are:', a:['Care, Welfare, Safety, Security','Control, Warning, Safety, Supervision','Calm, Wait, Separate, Contain'], correct:0},",
  "  {q:'If Marcus is in an active PTSD flashback, your FIRST action is:', a:['Increase lighting and speak louder to orient him','Call a code team immediately','Lower stimulation, announce every movement, use grounding language'], correct:2},",
  "  {q:'Non-punitive limit setting sounds like:', a:['Do it again and you lose phone privileges.','I cannot allow that for safety. What I CAN offer is...','Calm down or I will have to restrain you.'], correct:1},",
  "  {q:'After a crisis stabilizes, when is the best time to debrief Marcus?', a:['Immediately while emotions are high','After stabilization, with his consent, in a safe environment','Only when mandated by the incident report'], correct:1}",
  "];"
)
$lines = $lines[0..($qStart-1)] + $newQ + $lines[($qEnd+1)..($lines.Length-1)]
Write-Host "Quiz questions replaced (lines $qStart to $qEnd -> $($newQ.Length) lines)"

# ── 2. Add marcusState variable after drillStats line ────────────────────────
$dsLine = 0..($lines.Length-1) | Where-Object { $lines[$_] -match "let drillStats = \{" } | Select-Object -First 1
$alreadyHas = 0..($lines.Length-1) | Where-Object { $lines[$_] -match "marcusState" } | Select-Object -First 1
if ($alreadyHas -eq $null) {
    $lines = $lines[0..$dsLine] + "let marcusState = 'Neutral'; // Neutral, Frustrated, Rage" + $lines[($dsLine+1)..($lines.Length-1)]
    Write-Host "marcusState variable added"
} else { Write-Host "marcusState already exists at line $alreadyHas" }

# ── 3. Add section XP milestone + idle timer reset inside showSlide ──────────
$ssEnd = 0..($lines.Length-1) | Where-Object { $lines[$_] -match "resetSlideIdleTimer\(\)" } | Select-Object -First 1
if ($ssEnd -ne $null) { Write-Host "idle timer already present, skipping" }
else {
    # Find the "lastSpokenSlide = target;" line (end of the auto-guidance block)
    $lastSp = 0..($lines.Length-1) | Where-Object { $lines[$_] -match "lastSpokenSlide = target;" } | Select-Object -First 1
    # Find the closing brace of showSlide after that
    $closeB = ($lastSp+1)..($lines.Length-1) | Where-Object { $lines[$_].Trim() -eq "}" } | Select-Object -First 1
    $insertLines = @(
        "  // Section milestone: +50 XP every 5 slides (first visit only)",
        "  if(target > 0 && target % 5 === 0) {",
        "    const mKey = 'milestone_' + target;",
        "    if(!window._userData?.[mKey]) {",
        "      awardXP(50);",
        "      showXPToast(50, '5-Slide Section Complete');",
        "      if(window._userData) window._userData[mKey] = true;",
        "      window._saveUserData({ [mKey]: true }).catch(()=>{});",
        "    }",
        "  }",
        "  // Reset idle nudge timer each slide",
        "  resetSlideIdleTimer();"
    )
    $lines = $lines[0..($closeB-1)] + $insertLines + $lines[$closeB..($lines.Length-1)]
    Write-Host "Section XP + idle timer added before showSlide closing brace (line $closeB)"
}

# ── 4. Add resetSlideIdleTimer function before nextSlide ─────────────────────
$nextSlideLine = 0..($lines.Length-1) | Where-Object { $lines[$_] -match "^function nextSlide\(\)" } | Select-Object -First 1
$alreadyIdle = 0..($lines.Length-1) | Where-Object { $lines[$_] -match "function resetSlideIdleTimer" } | Select-Object -First 1
if ($alreadyIdle -ne $null) { Write-Host "resetSlideIdleTimer already exists" }
else {
    $idleFn = @(
        "// -- Idle nudge timer: Vance speaks if trainee lingers 45s without navigating --",
        "let slideIdleTimer = null;",
        "function resetSlideIdleTimer() {",
        "  clearTimeout(slideIdleTimer);",
        "  slideIdleTimer = setTimeout(() => {",
        "    const hub = document.getElementById('home-gateway');",
        "    if(hub && hub.style.display === 'flex') return;",
        "    if(paxMuted) return;",
        "    const nudges = [",
        "      'Don\'t miss the detail on the right - that could be a safety breach.',",
        "      'This concept maps directly to how we approach Marcus. Think about the timing.',",
        "      'This is certification exam material. Lock it in before moving on.',",
        "      'Think of Marcus right now - how would this principle change your next move?'",
        "    ];",
        "    const n = nudges[Math.floor(Math.random() * nudges.length)];",
        "    showAvatarAndSpeak('_direct_', currentFirstName(), n);",
        "  }, 45000);",
        "}",
        ""
    )
    $lines = $lines[0..($nextSlideLine-1)] + $idleFn + $lines[$nextSlideLine..($lines.Length-1)]
    Write-Host "resetSlideIdleTimer function added before nextSlide (line $nextSlideLine)"
}

# Write file back
[System.IO.File]::WriteAllLines($file, $lines, $enc)
Write-Host "Done. File written."

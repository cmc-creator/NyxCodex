$file = "\\\\192.168.168.182\\Folder Redirection\\Ccooper\\Documents\\Training Lab\\trainer_pro.html"
$enc  = [System.Text.UTF8Encoding]::new($false)
$lines = [System.IO.File]::ReadAllLines($file, $enc)
$out  = [System.Collections.Generic.List[string]]::new()
$changes = [System.Collections.Generic.List[string]]::new()

# ── 1. Inject marcusState into sendChatMessage system prompt ─────────────
# Find the line that starts the const sys = mode === 'lab' block and
# insert a statePrefix line before it, then replace the two backtick
# openings to prepend the variable.
$stateInjected = $false
$inSys = $false
for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    # Detect start of the sys const in sendChatMessage
    if (!$stateInjected -and $line -match "^\s*const sys = mode === 'lab'") {
        # Insert statePrefix before this line
        $out.Add("  const _mState = (typeof marcusState !== 'undefined') ? marcusState : 'Neutral';")
        $out.Add("  const _mPrefix = `"Marcus's current emotional state: `${_mState}. `";")
        # Now push the sys line itself but modify the two template literal lines so they
        # prepend _mPrefix. We'll handle the next two encountered backtick-starting lines.
        $inSys = $true
        $stateInjected = $true
        $sysBtCount = 0
        $out.Add($line)
        $changes.Add("Inserted _mState/_mPrefix before sendChatMessage sys const")
        continue
    }
    if ($inSys -and $sysBtCount -lt 2 -and $line -match "^\s*\? ``You are" -or ($inSys -and $sysBtCount -lt 2 -and $line -match "^\s*: ``You are")) {
        # Prepend _mPrefix inside the template literal
        $out.Add($line -replace "(``You are)", "`${_mPrefix}You are")
        $sysBtCount++
        if ($sysBtCount -ge 2) { $inSys = $false }
        continue
    }
    $out.Add($line)
}

if ($stateInjected) { $changes.Add("marcusState injected into sendChatMessage system prompt") }

# ── 2. Add micro-expression drill JS before the closing </script> tag ─────
$meAdded = $false
$final = [System.Collections.Generic.List[string]]::new()
for ($i = 0; $i -lt $out.Count; $i++) {
    $line = $out[$i]
    # Look for the last </script> before </body>
    if (!$meAdded -and $line -match "^\s*</script>" -and $i -gt ($out.Count - 80)) {
        $meJs = @'
// ─── Micro-Expression Drill ──────────────────────────────────────────────
const MICROEXP_ROUNDS = [
  { prompt: "Marcus crosses his arms, jaw tightens, eyes narrow at the corners. He just heard you say 'You have to calm down.'", emotion: "Anger", tip: "Jaw tightening + narrowed eyes signals suppressed anger. Never command calm — offer choice instead." },
  { prompt: "Marcus goes still. His brows pull together and upward. His lips press together. A door just slammed in the hall.", emotion: "Fear", tip: "Inner brow raise plus lip press indicates startle/fear. Lower your voice, slow your movements, give space." },
  { prompt: "Marcus's gaze drops to the floor. Corners of his mouth pull down slightly. He says 'It doesn't matter anymore.'", emotion: "Sadness", tip: "Downward gaze + lip corners pulling down signals despair. Move to empathic listening — validate, don't problem-solve." },
  { prompt: "Marcus sits in the chair, arms resting, face relaxed, eyes at mid-level. He responds to your name prompt with 'Yeah.'", emotion: "Neutral", tip: "Relaxed facial muscles, neutral gaze = regulated state. Use this window to build rapport and offer choices." },
  { prompt: "Marcus's nostrils flare briefly. His upper lip twitches. He turns slightly away while you speak.", emotion: "Anger", tip: "Nostril flare + upper lip pull is micro-contempt or disgust. Avoid confrontational language immediately." },
  { prompt: "Marcus glances rapidly toward the door twice. His breathing is visibly shallow. His hands grip the chair arms.", emotion: "Fear", tip: "Rapid eye movement toward exits + shallow breathing = threat assessment. State the environment is safe; don't block the exit." },
  { prompt: "Marcus stares at the table. His shoulders slump. He hasn't responded in 90 seconds.", emotion: "Sadness", tip: "Withdrawn stillness + slumped posture signals shutdown. Silence can be therapeutic — wait before re-prompting." },
  { prompt: "Marcus makes brief eye contact, nods once, and says 'I hear you.' His body language is open.", emotion: "Neutral", tip: "Brief eye contact + open body = engagement signal. Transition to collaborative problem solving now." }
];
let _meIndex = 0;
let _meScore = 0;
let _meTimerHandle = null;
let _meTimerBarHandle = null;
let _meAnswered = false;

function startMicroExpDrill() {
  _meIndex = 0; _meScore = 0; _meAnswered = false;
  document.getElementById('microexp-score').textContent = '0';
  document.getElementById('microexp-total').textContent = '0';
  const res = document.getElementById('microexp-result-badge');
  if(res) res.style.display = 'none';
  const tip = document.getElementById('microexp-vance-tip');
  if(tip) tip.style.display = 'none';
  nextMicroExpRound();
}

function nextMicroExpRound() {
  if(_meIndex >= MICROEXP_ROUNDS.length) {
    const prompt = document.getElementById('microexp-prompt');
    if(prompt) prompt.textContent = 'Drill complete! Score: ' + _meScore + '/' + MICROEXP_ROUNDS.length;
    const wrap = document.getElementById('microexp-timer-bar-wrap');
    if(wrap) wrap.style.display = 'none';
    awardXP(_meScore * 30);
    showXPToast(_meScore * 30, 'Micro-Exp Drill Complete');
    speakWithVance('Excellent drill work. You identified ' + _meScore + ' out of ' + MICROEXP_ROUNDS.length + ' expressions. In a real crisis, that reaction time saves lives.');
    return;
  }
  _meAnswered = false;
  const round = MICROEXP_ROUNDS[_meIndex];
  const prompt = document.getElementById('microexp-prompt');
  if(prompt) prompt.textContent = round.prompt;
  const res = document.getElementById('microexp-result-badge');
  if(res) res.style.display = 'none';
  const tip = document.getElementById('microexp-vance-tip');
  if(tip) tip.style.display = 'none';
  // Start 3-second timer bar
  const wrap = document.getElementById('microexp-timer-bar-wrap');
  const bar  = document.getElementById('microexp-timer-bar');
  if(wrap) wrap.style.display = 'block';
  if(bar)  { bar.style.width = '100%'; bar.style.background = '#22c55e'; bar.style.transition = 'none'; }
  clearTimeout(_meTimerHandle);
  clearInterval(_meTimerBarHandle);
  const START = Date.now();
  const DURATION = 3000;
  _meTimerBarHandle = setInterval(() => {
    const pct = Math.max(0, 1 - (Date.now() - START) / DURATION);
    if(bar) {
      bar.style.transition = 'none';
      bar.style.width = (pct * 100) + '%';
      bar.style.background = pct > 0.5 ? '#22c55e' : pct > 0.25 ? '#f59e0b' : '#ef4444';
    }
    if(pct <= 0) clearInterval(_meTimerBarHandle);
  }, 50);
  _meTimerHandle = setTimeout(() => {
    if(!_meAnswered) answerMicroExp(null);
  }, DURATION);
}

function answerMicroExp(chosen) {
  if(_meAnswered) return;
  _meAnswered = true;
  clearTimeout(_meTimerHandle);
  clearInterval(_meTimerBarHandle);
  const round = MICROEXP_ROUNDS[_meIndex];
  const correct = round.emotion;
  const isRight = chosen === correct;
  if(isRight) _meScore++;
  document.getElementById('microexp-score').textContent = _meScore;
  document.getElementById('microexp-total').textContent = _meIndex + 1;
  const bar = document.getElementById('microexp-timer-bar');
  if(bar) { bar.style.width = '0'; }
  const res = document.getElementById('microexp-result-badge');
  if(res) {
    res.style.display = 'inline-block';
    if(chosen === null) {
      res.textContent = 'Too slow! Correct: ' + correct;
      res.style.background = '#fee2e2'; res.style.color = '#991b1b';
    } else if(isRight) {
      res.textContent = 'Correct!';
      res.style.background = '#dcfce7'; res.style.color = '#166534';
      if(isRight) awardXP(30);
    } else {
      res.textContent = 'Incorrect — was ' + correct;
      res.style.background = '#fef9c3'; res.style.color = '#854d0e';
    }
  }
  const tipEl = document.getElementById('microexp-vance-tip');
  const tipTxt = document.getElementById('microexp-vance-text');
  if(tipEl && tipTxt) { tipTxt.textContent = round.tip; tipEl.style.display = 'block'; }
  speakWithVance(round.tip);
  _meIndex++;
  setTimeout(nextMicroExpRound, 3200);
}
// ─────────────────────────────────────────────────────────────────────────
'@
        foreach ($jsLine in ($meJs -split "`n")) {
            $final.Add($jsLine)
        }
        $meAdded = $true
        $changes.Add("Micro-expression drill JS added before closing </script>")
    }
    $final.Add($line)
}

[System.IO.File]::WriteAllLines($file, $final, $enc)

Write-Host "patch2.ps1 complete:"
foreach ($c in $changes) { Write-Host "  + $c" }

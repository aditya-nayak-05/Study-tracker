import re

def process_file(path, replacements):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in replacements:
        content = re.sub(old, new, content)
        
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# File 1: QuestionSetDetail.jsx
f1 = 'A:/DS/src/components/questions/QuestionSetDetail.jsx'
r1 = [
    (r'<div className="space-y-6">', r'<div className="space-y-8">'),
    (r'text-xs(.*?)Back to Question Sets', r'text-[13px]\1Back to Question Sets'),
    (r'px-4 py-2 (.*?)text-xs(.*?)Practice Mode', r'px-4 py-2.5 \1text-[13px]\2Practice Mode'),
    (r'px-3.5 py-2 (.*?)text-xs(.*?)Add Question', r'px-4 py-2.5 \1text-[13px]\2Add Question'),
    (r'px-3.5 py-2 (.*?)text-xs(.*?)Paste Questions', r'px-4 py-2.5 \1text-[13px]\2Paste Questions'),
    (r'p-6 (.*?)dash-card', r'p-7 sm:p-8 \1dash-card'),
    (r'text-2xl sm:text-3xl', r'text-2xl sm:text-[34px]'),
    (r'text-xs sm:text-sm', r'text-sm sm:text-[15px]'),
    (r'text-\[10px\] font-bold text-muted uppercase tracking-wider', r'text-[11px] font-bold text-muted uppercase tracking-wider'),
    (r'text-2xl font-black text-main font-mono', r'text-3xl font-black text-main font-mono'),
    (r'text-\[10px\] text-muted block', r'text-[11px] text-muted block'),
    (r'h-2 rounded-full overflow-hidden', r'h-[6px] rounded-full overflow-hidden'),
    (r'text-xs font-bold text-muted">\s*<div className="flex items-center gap-3">\s*<span className="text-main">', r'text-[13px] font-bold text-muted">\n            <div className="flex items-center gap-3">\n              <span className="text-main">'),
    (r'text-xs(.*?)focus:outline-none inset-field text-main font-medium', r'text-sm\1focus:outline-none inset-field text-main font-medium'),
    (r'px-3 py-2 rounded-xl inset-field text-xs font-semibold text-muted', r'px-3 py-2 rounded-xl inset-field text-[13px] font-semibold text-muted'),
    (r'cursor-pointer text-xs">\s*<option', r'cursor-pointer text-[13px]">\n                <option'),
    (r'px-3 py-2 rounded-xl text-xs font-semibold', r'px-3 py-2 rounded-xl text-[13px] font-semibold'),
    (r'px-3 py-1 text-xs font-bold', r'px-3.5 py-1.5 text-[13px] font-bold'),
    (r'gap-3 p-3 rounded-2xl(.*?)text-xs', r'gap-3 p-3 rounded-2xl\1text-[13px]'),
    (r'px-3 py-1.5 (.*?)Mark Completed', r'px-3.5 py-2 \1Mark Completed'),
    (r'px-3 py-1.5 (.*?)Mark Incomplete', r'px-3.5 py-2 \1Mark Incomplete'),
    (r'px-3 py-1.5 (.*?)Delete Selected', r'px-3.5 py-2 \1Delete Selected'),
    (r'<div className="space-y-3.5">', r'<div className="space-y-4">'),
    (r'text-base font-bold text-main', r'text-lg font-bold text-main'),
    (r'text-xs text-muted max-w-sm mx-auto', r'text-sm text-muted max-w-sm mx-auto'),
    (r'<div className="space-y-3">', r'<div className="space-y-4">'),
    (r'brass-btn px-4 py-2 rounded-xl text-xs', r'brass-btn px-4 py-2 rounded-xl text-[13px]'),
    (r'px-4 py-2 rounded-xl text-xs font-bold inset-field', r'px-4 py-2 rounded-xl text-[13px] font-bold inset-field')
]
process_file(f1, r1)

# File 2: AnalyticsView.jsx
f2 = 'A:/DS/src/components/questions/AnalyticsView.jsx'
r2 = [
    (r'p-5 rounded-2xl border dash-card', r'p-6 rounded-2xl border dash-card min-h-[120px]'),
    (r'text-3xl font-black text-main font-mono', r'text-[34px] font-black text-main font-mono'),
    (r'text-xs font-bold uppercase tracking-wider', r'text-[13px] font-semibold uppercase tracking-wider'),
    (r'text-\[11px\] text-muted', r'text-xs text-muted'),
    (r'my-2 flex items-baseline', r'my-3 flex items-baseline'),
    (r'my-2">\s*<span', r'my-3">\n            <span'),
    (r'p-6 rounded-3xl border border-\[var\(--neu-border\)\](.*?)Completion Velocity', r'p-7 rounded-3xl border border-[var(--neu-border)]\1Completion Velocity'),
    (r'text-xs font-semibold text-muted">Completed', r'text-sm font-semibold text-muted">Completed'),
    (r'text-xl font-black text-main font-mono', r'text-2xl font-black text-main font-mono'),
    (r'p-6 rounded-3xl border border-\[var\(--neu-border\)\](.*?)Questions Completed', r'p-7 rounded-3xl border border-[var(--neu-border)]\1Questions Completed'),
    (r'h-44 flex items-end', r'h-52 flex items-end'),
    (r'p-6 rounded-3xl border border-\[var\(--neu-border\)\](.*?)Question Set Mastery Breakdown', r'p-7 rounded-3xl border border-[var(--neu-border)]\1Question Set Mastery Breakdown'),
    (r'text-sm font-bold text-main uppercase tracking-wider">\s*Question Set Mastery Breakdown', r'text-[15px] font-bold text-main uppercase tracking-wider">\n          Question Set Mastery Breakdown'),
    (r'p-4 rounded-2xl inset-field bg-\[var\(--neu-inset-bg\)\]', r'p-5 rounded-2xl inset-field bg-[var(--neu-inset-bg)]'),
    (r'h-2 rounded-full overflow-hidden', r'h-[6px] rounded-full overflow-hidden'),
    (r'p-6 rounded-3xl border border-\[var\(--neu-border\)\](.*?)Data Management', r'p-7 rounded-3xl border border-[var(--neu-border)]\1Data Management'),
    (r'text-sm font-bold text-main uppercase tracking-wider">\s*Data Management', r'text-[15px] font-bold text-main uppercase tracking-wider">\n              Data Management'),
    (r'p-4 rounded-2xl border border-\[var\(--neu-border-subtle\)\]', r'p-5 rounded-2xl border border-[var(--neu-border-subtle)]'),
    (r'p-4 rounded-2xl border border-red-500/20', r'p-5 rounded-2xl border border-red-500/20'),
    (r'text-xs font-bold text-main block', r'text-[13px] font-bold text-main block'),
    (r'text-xs font-bold text-red-400 block', r'text-[13px] font-bold text-red-400 block'),
    (r'text-\[11px\] text-muted mt-1 leading-relaxed', r'text-xs text-muted mt-1 leading-relaxed'),
    (r'gap-4 sm:gap-5', r'gap-5 sm:gap-6'),
    (r'<div className="space-y-8">', r'<div className="space-y-10">'),
    (r'py-2 rounded-xl text-xs font-bold flex', r'py-2 rounded-xl text-[13px] font-bold flex'),
    (r'py-2 rounded-xl text-xs font-bold border', r'py-2 rounded-xl text-[13px] font-bold border'),
    (r'py-2 rounded-xl text-xs font-bold bg-red-500/15', r'py-2 rounded-xl text-[13px] font-bold bg-red-500/15')
]
process_file(f2, r2)

# File 3: PracticeMode.jsx
f3 = 'A:/DS/src/components/questions/PracticeMode.jsx'
r3 = [
    (r'<div className="max-w-4xl mx-auto space-y-6">', r'<div className="max-w-4xl mx-auto space-y-8">'),
    (r'p-4 rounded-2xl border border-\[var\(--neu-border\)\]', r'p-5 sm:p-6 rounded-2xl border border-[var(--neu-border)]'),
    (r'px-3 py-1.5 rounded-xl text-xs font-semibold', r'px-3 py-1.5 rounded-xl text-[13px] font-semibold'),
    (r'px-3 py-1.5 text-xs font-bold rounded-xl border', r'px-3 py-1.5 text-[13px] font-bold rounded-xl border'),
    (r'px-2.5 py-1 text-\[11px\] font-bold rounded-lg', r'px-2.5 py-1 text-xs font-bold rounded-lg'),
    (r'h-2 rounded-full overflow-hidden', r'h-[6px] rounded-full overflow-hidden'),
    (r'text-muted uppercase tracking-wider text-\[11px\]', r'text-muted uppercase tracking-wider text-xs'),
    (r'p-6 sm:p-10 rounded-3xl border leather-card', r'p-7 sm:p-10 rounded-3xl border leather-card'),
    (r'text-xs font-mono font-black text-muted', r'text-sm font-mono font-black text-muted'),
    (r'text-xl sm:text-2xl md:text-3xl', r'text-2xl sm:text-3xl md:text-4xl'),
    (r'text-sm font-bold flex items-center gap-2', r'text-base font-bold flex items-center gap-2'),
    (r'px-6 py-3 rounded-2xl', r'px-7 py-3.5 rounded-2xl'),
    (r'text-sm sm:text-base text-main', r'text-base sm:text-lg text-main'),
    (r'px-4 py-2.5 rounded-xl text-xs', r'px-5 py-3 rounded-xl text-[13px]'),
    (r'px-5 py-2.5 rounded-xl text-xs', r'px-6 py-3 rounded-xl text-[13px]'),
    (r'text-\[11px\] text-muted font-mono', r'text-xs text-muted font-mono'),
    (r'text-base font-bold text-main', r'text-lg font-bold text-main')
]
process_file(f3, r3)

print("Done")

import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  AlertTriangle,
  Boxes,
  Check,
  ChevronRight,
  CircleDot,
  Factory,
  Flame,
  GitBranch,
  Hammer,
  Info,
  PackageSearch,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react'
import './index.css'
import { MACHINES, TIERS, items, rawItems, recipes, tierRank } from './data.js'

const STORAGE_KEY = 'gtnh-helper-vite-tailwind-state'

function cls(...classes) {
  return classes.filter(Boolean).join(' ')
}

function getItemName(id) {
  return items.find((item) => item.id === id)?.name || rawItems[id] || id.replaceAll('_', ' ')
}

function ceilDiv(a, b) {
  return Math.ceil(a / b)
}

function canUseTier(recipeTier, currentTier) {
  return tierRank[recipeTier] <= tierRank[currentTier]
}

function recipeScore(recipe, ownedMachines) {
  let score = 0
  if (recipe.tags?.includes('recommended')) score -= 10
  if (recipe.tags?.includes('placeholder')) score += 7
  if (!ownedMachines.includes(recipe.machine) && !recipe.machine.includes('Manual')) score += 30
  return score
}

function pickRecipe(itemId, currentTier, ownedMachines) {
  const candidates = recipes.filter((recipe) => recipe.output.itemId === itemId && canUseTier(recipe.tier, currentTier))
  if (!candidates.length) return null
  return [...candidates].sort((a, b) => recipeScore(a, ownedMachines) - recipeScore(b, ownedMachines))[0]
}

function buildTree(itemId, amount, currentTier, ownedMachines, depth = 0, seen = new Set()) {
  const recipe = pickRecipe(itemId, currentTier, ownedMachines)
  if (!recipe || seen.has(itemId) || depth > 8) {
    return { itemId, amount, recipe: null, children: [] }
  }

  const batches = ceilDiv(amount, recipe.output.amount)
  const nextSeen = new Set(seen)
  nextSeen.add(itemId)

  return {
    itemId,
    amount,
    recipe,
    children: recipe.inputs.map((input) => buildTree(input.itemId, input.amount * batches, currentTier, ownedMachines, depth + 1, nextSeen)),
  }
}

function flattenRaw(node, result = {}) {
  if (!node.recipe || node.children.length === 0) {
    result[node.itemId] = (result[node.itemId] || 0) + node.amount
    return result
  }
  node.children.forEach((child) => flattenRaw(child, result))
  return result
}

function collectMachines(node, result = new Set()) {
  if (node.recipe?.machine) result.add(node.recipe.machine)
  node.children.forEach((child) => collectMachines(child, result))
  return result
}

function countPlaceholderRecipes(node) {
  let count = node.recipe?.tags?.includes('placeholder') ? 1 : 0
  node.children.forEach((child) => {
    count += countPlaceholderRecipes(child)
  })
  return count
}

function Pill({ children, className }) {
  return <span className={cls('inline-flex items-center rounded-full border border-zinc-800 bg-zinc-950/80 px-3 py-1 text-xs font-medium text-zinc-300', className)}>{children}</span>
}

function Stars({ value }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`중요도 ${value} / 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className={cls('h-4 w-4', index < value ? 'fill-amber-300 text-amber-300' : 'text-zinc-700')} />
      ))}
    </div>
  )
}

function MachineButton({ machine, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cls(
        'rounded-2xl border px-3 py-2 text-left text-sm transition hover:-translate-y-0.5',
        active
          ? 'border-emerald-400/60 bg-emerald-400/10 text-emerald-100 shadow-glow'
          : 'border-zinc-800 bg-zinc-950/70 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200',
      )}
    >
      <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-current/30 align-middle text-[10px]">
        {active ? <Check className="h-3 w-3" /> : <CircleDot className="h-3 w-3" />}
      </span>
      {machine}
    </button>
  )
}

function ItemCard({ item, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cls(
        'group w-full rounded-3xl border p-4 text-left transition hover:-translate-y-0.5',
        selected
          ? 'border-emerald-400/60 bg-emerald-400/10 shadow-glow'
          : 'border-zinc-800 bg-zinc-950/70 hover:border-zinc-600',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-zinc-100">{item.name}</div>
          <div className="mt-1 text-xs text-zinc-500">{item.category} · 제작 가능: {item.craftableFromTier}</div>
        </div>
        <ChevronRight className="mt-1 h-4 w-4 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-zinc-300" />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <Stars value={item.importance} />
        <span className="rounded-full bg-zinc-900 px-2 py-1 text-[11px] text-zinc-400">{item.recommendedFromTier}</span>
      </div>
    </button>
  )
}

function TreeNode({ node, level = 0 }) {
  return (
    <div className="text-sm">
      <div className="flex gap-3 py-2" style={{ paddingLeft: `${level * 18}px` }}>
        <div className={cls('mt-1 h-5 w-5 shrink-0 rounded-full border', node.recipe ? 'border-emerald-400/50 bg-emerald-400/10' : 'border-zinc-700 bg-zinc-900')} />
        <div className="min-w-0">
          <div className="font-medium text-zinc-100">
            {getItemName(node.itemId)} <span className="text-emerald-300">x{node.amount}</span>
          </div>
          {node.recipe ? (
            <div className="mt-1 text-xs text-zinc-500">
              경로: {node.recipe.machine} · {node.recipe.tier}{node.recipe.tags?.includes('placeholder') ? ' · placeholder' : ''}
            </div>
          ) : (
            <div className="mt-1 text-xs text-zinc-600">기초 재료 / 현재 데이터셋에 하위 경로 없음</div>
          )}
        </div>
      </div>
      {node.children.map((child, index) => (
        <TreeNode key={`${node.itemId}-${child.itemId}-${index}-${level}`} node={child} level={level + 1} />
      ))}
    </div>
  )
}

function App() {
  const [query, setQuery] = useState('')
  const [tier, setTier] = useState('LV')
  const [category, setCategory] = useState('전체')
  const [ownedMachines, setOwnedMachines] = useState(['Wiremill', 'Lathe', 'Assembler'])
  const [selectedItemId, setSelectedItemId] = useState('lv_electric_motor')
  const [amount, setAmount] = useState(16)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return
    try {
      const parsed = JSON.parse(saved)
      if (parsed.tier) setTier(parsed.tier)
      if (Array.isArray(parsed.ownedMachines)) setOwnedMachines(parsed.ownedMachines)
      if (parsed.selectedItemId) setSelectedItemId(parsed.selectedItemId)
      if (parsed.amount) setAmount(parsed.amount)
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tier, ownedMachines, selectedItemId, amount }))
  }, [tier, ownedMachines, selectedItemId, amount])

  const categories = useMemo(() => ['전체', ...Array.from(new Set(items.map((item) => item.category)))], [])

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items
      .filter((item) => category === '전체' || item.category === category)
      .filter((item) => !q || item.name.toLowerCase().includes(q) || item.tags.join(' ').toLowerCase().includes(q))
      .filter((item) => tierRank[item.craftableFromTier] <= tierRank[tier] + 1)
      .sort((a, b) => b.importance - a.importance || tierRank[a.craftableFromTier] - tierRank[b.craftableFromTier])
  }, [category, query, tier])

  const selectedItem = items.find((item) => item.id === selectedItemId) || items[0]
  const tree = useMemo(() => buildTree(selectedItem.id, Number(amount) || 1, tier, ownedMachines), [selectedItem.id, amount, tier, ownedMachines])
  const rawMaterials = useMemo(() => flattenRaw(tree), [tree])
  const machines = useMemo(() => Array.from(collectMachines(tree)), [tree])
  const placeholderCount = useMemo(() => countPlaceholderRecipes(tree), [tree])
  const canCraft = tierRank[selectedItem.craftableFromTier] <= tierRank[tier]

  function toggleMachine(machine) {
    setOwnedMachines((prev) => (prev.includes(machine) ? prev.filter((name) => name !== machine) : [...prev, machine]))
  }

  return (
    <main className="min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none fixed inset-0 -z-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_38%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.12),transparent_35%),linear-gradient(to_bottom,#09090b,#050505)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        <section className="mb-6 rounded-[2rem] border border-zinc-800/90 bg-zinc-950/70 p-6 shadow-2xl shadow-black/40 backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">
                <Factory className="h-4 w-4" /> GTNH Helper v0.1
              </div>
              <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white md:text-6xl">
                티어 기반 아이템 가이드 & 레시피 플래너
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400 md:text-base">
                GregTech: New Horizons의 핵심 아이템을 검색하고, 언제부터 만들 수 있는지와 언제부터 유용한지 확인한 뒤, 현재 티어와 보유 기계 기준으로 간단한 재료 트리를 생성합니다.
              </p>
            </div>
            <div className="grid gap-3 rounded-3xl border border-zinc-800 bg-zinc-900/70 p-4 sm:grid-cols-2 lg:w-[420px]">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                현재 티어
                <select value={tier} onChange={(event) => setTier(event.target.value)} className="mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-emerald-400">
                  {TIERS.map((name) => <option key={name}>{name}</option>)}
                </select>
              </label>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                목표 개수
                <input type="number" min="1" value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-emerald-400" />
              </label>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-zinc-800 bg-zinc-950/70 p-5 shadow-xl shadow-black/20 backdrop-blur">
              <div className="mb-4 flex items-center gap-2 font-bold">
                <Search className="h-5 w-5 text-emerald-300" /> 검색
              </div>
              <div className="space-y-3">
                <div className="relative">
                  <PackageSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="motor, cable, circuit, 회로..." className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-400" />
                </div>
                <select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm outline-none transition focus:border-emerald-400">
                  {categories.map((name) => <option key={name}>{name}</option>)}
                </select>
              </div>
            </section>

            <section className="rounded-[2rem] border border-zinc-800 bg-zinc-950/70 p-5 shadow-xl shadow-black/20 backdrop-blur">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-bold"><Hammer className="h-5 w-5 text-emerald-300" /> 보유 기계</div>
                <span className="text-xs text-zinc-500">{ownedMachines.length}개 선택됨</span>
              </div>
              <div className="grid gap-2">
                {MACHINES.map((machine) => (
                  <MachineButton key={machine} machine={machine} active={ownedMachines.includes(machine)} onClick={() => toggleMachine(machine)} />
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-zinc-800 bg-zinc-950/70 p-5 shadow-xl shadow-black/20 backdrop-blur">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-bold"><Boxes className="h-5 w-5 text-emerald-300" /> 아이템</div>
                <span className="text-xs text-zinc-500">{filteredItems.length}</span>
              </div>
              <div className="scrollbar-thin max-h-[520px] space-y-3 overflow-y-auto pr-1">
                {filteredItems.map((item) => (
                  <ItemCard key={item.id} item={item} selected={item.id === selectedItem.id} onClick={() => setSelectedItemId(item.id)} />
                ))}
              </div>
            </section>
          </aside>

          <section className="space-y-6">
            <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950/70 p-6 shadow-xl shadow-black/20 backdrop-blur">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="mb-4 flex flex-wrap gap-2">
                    <Pill>{selectedItem.category}</Pill>
                    <Pill>제작 가능: {selectedItem.craftableFromTier}</Pill>
                    <Pill>추천 시작: {selectedItem.recommendedFromTier}</Pill>
                    <Pill>자동화 추천: {selectedItem.automationFromTier}</Pill>
                  </div>
                  <h2 className="text-3xl font-black tracking-tight text-white md:text-5xl">{selectedItem.name}</h2>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-300 md:text-base">{selectedItem.summary}</p>
                </div>
                <div className="min-w-[180px] rounded-3xl border border-zinc-800 bg-zinc-900/70 p-4">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">중요도</div>
                  <Stars value={selectedItem.importance} />
                </div>
              </div>

              {!canCraft && (
                <div className="mt-5 flex gap-3 rounded-3xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>현재 선택한 티어는 <b>{tier}</b>이지만, 이 아이템은 보통 <b>{selectedItem.craftableFromTier}</b>부터 제작 가능합니다.</div>
                </div>
              )}

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-4">
                  <div className="mb-3 flex items-center gap-2 font-bold"><Sparkles className="h-4 w-4 text-emerald-300" /> 주요 사용처</div>
                  <ul className="space-y-2 text-sm text-zinc-300">
                    {selectedItem.uses.map((use) => <li key={use}>• {use}</li>)}
                  </ul>
                </div>
                <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-4">
                  <div className="mb-3 flex items-center gap-2 font-bold"><ShieldCheck className="h-4 w-4 text-emerald-300" /> 비축 가이드</div>
                  <p className="text-sm leading-6 text-zinc-300">{selectedItem.stock}</p>
                </div>
                <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-4">
                  <div className="mb-3 flex items-center gap-2 font-bold"><Info className="h-4 w-4 text-emerald-300" /> 주의사항</div>
                  <p className="text-sm leading-6 text-zinc-300">{selectedItem.warning}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
              <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950/70 p-6 shadow-xl shadow-black/20 backdrop-blur">
                <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-bold"><GitBranch className="h-5 w-5 text-emerald-300" /> 레시피 트리</div>
                    <p className="mt-2 text-sm text-zinc-500">현재 티어와 선택한 기계를 기준으로 사용 가능한 간단한 제작 경로를 선택합니다.</p>
                  </div>
                  {placeholderCount > 0 && <Pill className="border-amber-400/30 bg-amber-400/10 text-amber-100">placeholder 레시피 {placeholderCount}개</Pill>}
                </div>
                <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-4">
                  <TreeNode node={tree} />
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950/70 p-5 shadow-xl shadow-black/20 backdrop-blur">
                  <div className="mb-4 flex items-center gap-2 font-bold"><Flame className="h-5 w-5 text-emerald-300" /> 기초 재료 합산</div>
                  <div className="space-y-2">
                    {Object.entries(rawMaterials).map(([id, count]) => (
                      <div key={id} className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm">
                        <span className="text-zinc-300">{getItemName(id)}</span>
                        <span className="font-bold text-emerald-300">x{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950/70 p-5 shadow-xl shadow-black/20 backdrop-blur">
                  <div className="mb-4 flex items-center gap-2 font-bold"><Settings2 className="h-5 w-5 text-emerald-300" /> 필요한 기계</div>
                  <div className="space-y-2">
                    {machines.length === 0 ? <div className="text-sm text-zinc-500">현재 데이터셋에 레시피 경로가 없습니다.</div> : machines.map((machine) => {
                      const owned = ownedMachines.includes(machine) || machine.includes('Manual')
                      return (
                        <div key={machine} className={cls('rounded-2xl border px-3 py-2 text-sm', owned ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100' : 'border-amber-400/30 bg-amber-400/10 text-amber-100')}>
                          {owned ? '✓' : '!'} {machine}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<App />)

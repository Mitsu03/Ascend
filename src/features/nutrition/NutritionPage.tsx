import { useEffect, useMemo, useState } from 'react'
import { CATEGORY_LABELS, getFood, searchFoods } from '@/data/foods'
import { Button, IconButton } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge, Disclaimer, EmptyState, Field, SearchInput, Select, TextInput } from '@/components/ui/Misc'
import { MacroBar, ProgressRing } from '@/components/ui/Progress'
import { Modal } from '@/components/ui/Modal'
import { formatNumber } from '@/lib/cn'
import { today } from '@/services/dates'
import { suggestMeals } from '@/services/suggestions'
import {
  MEAL_LABELS,
  MEAL_ORDER,
  checkProteinBonus,
  entryMacros,
  remainingMacros,
  useNutritionStore,
} from '@/store/nutritionStore'
import { useUserStore } from '@/store/userStore'
import type { Food, MealType } from '@/types'

function AddFoodModal({
  open,
  onClose,
  mealType,
}: {
  open: boolean
  onClose: () => void
  mealType: MealType
}) {
  const diet = useUserStore((state) => state.profile?.dietPreference ?? 'sem_preferencia')
  const targets = useUserStore((state) => state.targets)
  const addEntry = useNutritionStore((state) => state.addEntry)

  const [query, setQuery] = useState('')
  const [selectedMeal, setSelectedMeal] = useState<MealType>(mealType)
  const [food, setFood] = useState<Food | null>(null)
  const [grams, setGrams] = useState('100')

  useEffect(() => {
    if (open) {
      setSelectedMeal(mealType)
      setQuery('')
      setFood(null)
      setGrams('100')
    }
  }, [open, mealType])

  const results = useMemo(() => searchFoods(query, diet).slice(0, 40), [query, diet])
  const quantity = Number(grams)
  const preview = food && Number.isFinite(quantity) && quantity > 0
    ? entryMacros({ id: '', date: '', mealType: selectedMeal, foodId: food.id, grams: quantity })
    : null

  const confirm = () => {
    if (!food || !Number.isFinite(quantity) || quantity <= 0) return
    addEntry(selectedMeal, food.id, quantity)
    checkProteinBonus(targets)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registar alimento"
      description="Pesquisa no catálogo e ajusta a quantidade."
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-ink-muted">
            {preview ? `${formatNumber(preview.calories)} kcal · ${preview.proteinG} g proteína` : 'Escolhe um alimento'}
          </span>
          <div className="flex gap-2">
            <Button onClick={onClose}>Cancelar</Button>
            <Button variant="primary" icon="Plus" onClick={confirm} disabled={!preview}>
              Adicionar
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Refeição">
            {(id) => (
              <Select
                id={id}
                value={selectedMeal}
                onChange={(event) => setSelectedMeal(event.target.value as MealType)}
              >
                {MEAL_ORDER.map((meal) => (
                  <option key={meal} value={meal}>
                    {MEAL_LABELS[meal]}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Quantidade (g)" hint={food ? `Porção habitual: ${food.portionLabel}` : undefined}>
            {(id) => (
              <TextInput
                id={id}
                type="number"
                inputMode="numeric"
                min={1}
                value={grams}
                onChange={(event) => setGrams(event.target.value)}
              />
            )}
          </Field>
        </div>

        {food && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-cyan-electric/40 bg-cyan-electric/5 p-3.5">
            <div className="min-w-0">
              <p className="truncate font-medium text-ink">{food.name}</p>
              <p className="text-xs text-ink-muted">
                {food.per100g.calories} kcal / 100 g · P {food.per100g.proteinG} · H {food.per100g.carbsG} · G{' '}
                {food.per100g.fatG}
              </p>
            </div>
            <Button size="sm" onClick={() => setGrams(String(food.commonPortionG))}>
              Porção habitual
            </Button>
          </div>
        )}

        <SearchInput
          value={query}
          placeholder="Pesquisar alimento…"
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Pesquisar alimento"
        />

        <ul className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
          {results.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  setFood(item)
                  setGrams(String(item.commonPortionG))
                }}
                className={
                  food?.id === item.id
                    ? 'flex w-full items-center gap-3 rounded-xl border border-cyan-electric/60 bg-cyan-electric/10 p-3 text-left'
                    : 'flex w-full items-center gap-3 rounded-xl border border-night-600 bg-night-800/50 p-3 text-left transition-colors hover:border-night-500'
                }
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">{item.name}</span>
                  <span className="text-xs text-ink-faint">{item.portionLabel}</span>
                </span>
                <Badge tone="neutral">{CATEGORY_LABELS[item.category]}</Badge>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-cyan-electric">
                  {item.per100g.calories} kcal
                </span>
              </button>
            </li>
          ))}
          {results.length === 0 && (
            <li className="py-6 text-center text-sm text-ink-faint">
              Nenhum alimento encontrado para “{query}”.
            </li>
          )}
        </ul>
      </div>
    </Modal>
  )
}

function WaterCard() {
  const addWater = useNutritionStore((state) => state.addWater)
  const waterByDate = useNutritionStore((state) => state.waterByDate)
  const water = waterByDate[today()] ?? 0
  const goal = 2500

  return (
    <Card>
      <CardHeader title="Hidratação" subtitle={`Meta sugerida: ${goal / 1000} L`} icon="Droplets" />
      <CardBody className="space-y-3 pt-3">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-4xl font-bold tabular-nums text-cyan-electric">
            {(water / 1000).toFixed(2).replace('.', ',')}
          </span>
          <span className="text-ink-muted">L hoje</span>
        </div>
        <MacroBar label="Progresso" value={water} target={goal} unit="ml" tone="cyan" />
        <div className="flex gap-2">
          <Button size="sm" icon="Plus" onClick={() => addWater(250)}>
            250 ml
          </Button>
          <Button size="sm" icon="Plus" onClick={() => addWater(500)}>
            500 ml
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}

export function NutritionPage() {
  const profile = useUserStore((state) => state.profile)
  const targets = useUserStore((state) => state.targets)
  const entries = useNutritionStore((state) => state.entries)
  const entriesForDate = useNutritionStore((state) => state.entriesForDate)
  const totalsForDate = useNutritionStore((state) => state.totalsForDate)
  const removeEntry = useNutritionStore((state) => state.removeEntry)

  const [adding, setAdding] = useState<MealType | null>(null)

  const date = today()
  const todayEntries = useMemo(() => entriesForDate(date), [entries, entriesForDate, date])
  const totals = useMemo(() => totalsForDate(date), [entries, totalsForDate, date])
  const remaining = remainingMacros(totals, targets)

  const suggestions = useMemo(
    () => suggestMeals(remaining, profile?.dietPreference ?? 'sem_preferencia'),
    [remaining, profile?.dietPreference],
  )

  if (!targets) return null

  const overTarget = totals.calories > targets.calories * 1.05

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink">Nutrição</h1>
          <p className="mt-1 text-ink-muted">
            {formatNumber(remaining.calories)} kcal restantes de {formatNumber(targets.calories)}
          </p>
        </div>
        <Button variant="primary" icon="Plus" onClick={() => setAdding('almoco')}>
          Registar refeição
        </Button>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <Card>
          <CardHeader title="Resumo do dia" subtitle="Calorias e macronutrientes" icon="UtensilsCrossed" />
          <CardBody className="pt-3">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <ProgressRing
                value={totals.calories}
                max={targets.calories}
                size={160}
                tone={overTarget ? 'warn' : 'cyan'}
                label={`${formatNumber(totals.calories)} de ${formatNumber(targets.calories)} kcal`}
              >
                <span className="font-display text-4xl font-bold tabular-nums text-ink">
                  {formatNumber(totals.calories)}
                </span>
                <span className="text-xs text-ink-muted">de {formatNumber(targets.calories)} kcal</span>
              </ProgressRing>
              <div className="w-full flex-1 space-y-4">
                <MacroBar label="Proteína" value={totals.proteinG} target={targets.proteinG} tone="cyan" />
                <MacroBar label="Hidratos" value={totals.carbsG} target={targets.carbsG} tone="violet" />
                <MacroBar label="Gordura" value={totals.fatG} target={targets.fatG} tone="gold" />
                {overTarget && (
                  <Badge tone="warn" icon="AlertTriangle">
                    Acima da meta estimada — sem problema, ajusta amanhã.
                  </Badge>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        <WaterCard />
      </div>

      <Card>
        <CardHeader
          title="Sugestões para hoje"
          subtitle="Combinações do catálogo com base no que falta"
          icon="Sparkles"
        />
        <CardBody className="space-y-3 pt-3">
          {suggestions.message ? (
            <p className="rounded-xl border border-good/35 bg-good/5 p-4 text-sm leading-relaxed text-ink">
              {suggestions.message}
            </p>
          ) : (
            <>
              <p className="text-sm font-medium text-cyan-electric">{suggestions.suggestions[0]?.headline}</p>
              <ul className="space-y-2">
                {suggestions.suggestions.map((suggestion) => (
                  <li
                    key={suggestion.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-night-600 bg-night-800/50 p-3.5"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-ink">{suggestion.detail}</p>
                      <p className="mt-0.5 text-xs text-ink-faint">
                        {suggestion.foodIds.map((id) => getFood(id)?.name).filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Badge tone="cyan">{formatNumber(suggestion.totals.calories)} kcal</Badge>
                      <Badge tone="neutral">P {suggestion.totals.proteinG} g</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
          <Disclaimer>
            Sugestões automáticas geradas a partir do catálogo local. Não substituem aconselhamento clínico
            ou nutricional.
          </Disclaimer>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Diário de hoje" subtitle={`${todayEntries.length} registos`} icon="ListChecks" />
        <CardBody className="space-y-4 pt-3">
          {todayEntries.length === 0 && (
            <EmptyState
              icon="UtensilsCrossed"
              title="Ainda não registaste nada hoje"
              message="Adiciona a primeira refeição para começares a acompanhar calorias e macros."
              action={
                <Button variant="primary" icon="Plus" onClick={() => setAdding('pequeno_almoco')}>
                  Registar refeição
                </Button>
              }
            />
          )}

          {MEAL_ORDER.map((meal) => {
            const mealEntries = todayEntries.filter((entry) => entry.mealType === meal)
            if (mealEntries.length === 0) return null
            const mealTotal = mealEntries.reduce((sum, entry) => sum + entryMacros(entry).calories, 0)

            return (
              <section key={meal}>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-ink">{MEAL_LABELS[meal]}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs tabular-nums text-ink-muted">{formatNumber(mealTotal)} kcal</span>
                    <IconButton icon="Plus" label={`Adicionar a ${MEAL_LABELS[meal]}`} size="sm" onClick={() => setAdding(meal)} />
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {mealEntries.map((entry) => {
                    const food = getFood(entry.foodId)
                    const macros = entryMacros(entry)
                    return (
                      <li
                        key={entry.id}
                        className="flex items-center gap-3 rounded-xl border border-night-600 bg-night-800/40 p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink">{food?.name ?? 'Alimento'}</p>
                          <p className="text-xs text-ink-faint">
                            {entry.grams} g · P {macros.proteinG} · H {macros.carbsG} · G {macros.fatG}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-semibold tabular-nums text-cyan-electric">
                          {formatNumber(macros.calories)} kcal
                        </span>
                        <IconButton
                          icon="Trash2"
                          label={`Remover ${food?.name ?? 'alimento'}`}
                          size="sm"
                          onClick={() => removeEntry(entry.id)}
                        />
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}

          {todayEntries.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t border-night-700 pt-4">
              {MEAL_ORDER.map((meal) => (
                <Button key={meal} size="sm" icon="Plus" onClick={() => setAdding(meal)}>
                  {MEAL_LABELS[meal]}
                </Button>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <p className="flex items-start gap-2 text-xs leading-relaxed text-ink-faint">
        <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
        Os valores nutricionais do catálogo são aproximados e servem para orientação. Consulta o rótulo do
        produto para valores exatos.
      </p>

      <AddFoodModal open={adding !== null} mealType={adding ?? 'almoco'} onClose={() => setAdding(null)} />
    </div>
  )
}

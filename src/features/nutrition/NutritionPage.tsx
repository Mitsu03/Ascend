import { useEffect, useMemo, useState } from 'react'
import { getFood, searchFoods } from '@/data/foods'
import { ArtIcon } from '@/components/ArtIcon'
import { ScreenBackdrop } from '@/components/layout/ScreenBackdrop'
import { HeaderAction, ScreenHeader, ScreenTitle } from '@/components/layout/ScreenHeader'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Badge, Field, SearchInput, Select, TextInput } from '@/components/ui/Misc'
import { Modal } from '@/components/ui/Modal'
import { PhotoLogModal } from '@/features/nutrition/PhotoLogModal'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/cn'
import { WATER_GOAL_ML } from '@/services/calculations'
import { today } from '@/services/dates'
import { suggestMeals } from '@/services/suggestions'
import {
  MEAL_ORDER,
  checkProteinBonus,
  entryMacros,
  foodForEntry,
  remainingMacros,
  useNutritionStore,
} from '@/store/nutritionStore'
import { useUserStore } from '@/store/userStore'
import type { DailyTotals, Food, MacroTargets, MealEntry, MealType } from '@/types'


function AddFoodModal({
  open,
  onClose,
  mealType,
}: {
  open: boolean
  onClose: () => void
  mealType: MealType
}) {
  const { t, n, lang, loc } = useI18n()
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

  const results = useMemo(() => searchFoods(query, diet, lang).slice(0, 40), [query, diet, lang])
  const quantity = Number(grams)
  const preview =
    food && Number.isFinite(quantity) && quantity > 0
      ? entryMacros({ id: '', date: '', mealType: selectedMeal, foodId: food.id, grams: quantity })
      : null

  const confirm = () => {
    if (!food || !Number.isFinite(quantity) || quantity <= 0) return
    addEntry(selectedMeal, food, quantity)
    checkProteinBonus(targets)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.nutrition.addTitle}
      description={t.nutrition.addDescription}
      footer={
        // Ver a nota do rodapé gémeo em `CustomWorkoutModal`.
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="min-w-0 text-sm text-ink-muted">
            {preview ? t.nutrition.preview(n(preview.calories), preview.proteinG) : t.nutrition.pickFood}
          </span>
          <div className="ml-auto flex shrink-0 gap-2">
            <Button onClick={onClose}>{t.common.cancel}</Button>
            <Button variant="primary" icon="Plus" onClick={confirm} disabled={!preview}>
              {t.common.add}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t.nutrition.mealLabel}>
            {(id) => (
              <Select
                id={id}
                value={selectedMeal}
                onChange={(event) => setSelectedMeal(event.target.value as MealType)}
              >
                {MEAL_ORDER.map((meal) => (
                  <option key={meal} value={meal}>
                    {t.meals[meal]}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field
            label={t.nutrition.quantityLabel}
            hint={food ? t.nutrition.commonPortionHint(loc(food.portionLabel)) : undefined}
          >
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
          <div className="flex items-center justify-between gap-3 rounded-xl border border-ember/40 bg-ember/5 p-3.5">
            <div className="min-w-0">
              <p className="truncate font-medium text-ink">{loc(food.name)}</p>
              <p className="text-xs text-ink-muted">
                {t.nutrition.per100g(
                  food.per100g.calories,
                  food.per100g.proteinG,
                  food.per100g.carbsG,
                  food.per100g.fatG,
                )}
              </p>
            </div>
            <Button size="sm" onClick={() => setGrams(String(food.commonPortionG))}>
              {t.nutrition.commonPortion}
            </Button>
          </div>
        )}

        <SearchInput
          value={query}
          placeholder={t.nutrition.searchPlaceholder}
          onChange={(event) => setQuery(event.target.value)}
          aria-label={t.nutrition.searchAria}
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
                    ? 'flex w-full items-center gap-3 rounded-xl border border-ember/60 bg-ember/10 p-3 text-left'
                    : 'flex w-full items-center gap-3 rounded-xl border border-void-600 bg-void-800/50 p-3 text-left transition-colors hover:border-void-500'
                }
              >
                {/*
                  O nome do alimento cortava a uma linha: «Carne picada de vaca
                  (90% magra)» perdia 86 px dos seus 237 e ficava «Carne picada
                  de vaca (…» — sem a informação que a distingue das outras. A
                  categoria e as calorias deixam de disputar a mesma linha e o
                  nome passa a quebrar.
                */}
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-ink">{loc(item.name)}</span>
                  <span className="text-xs text-ink-faint">{loc(item.portionLabel)}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-sm font-semibold tabular-nums text-ember">
                    {item.per100g.calories} {t.units.kcal}
                  </span>
                  <Badge tone="neutral">{t.foodCategories[item.category]}</Badge>
                </span>
              </button>
            </li>
          ))}
          {results.length === 0 && (
            <li className="py-6 text-center text-sm text-ink-faint">{t.nutrition.noResults(query)}</li>
          )}
        </ul>
      </div>
    </Modal>
  )
}

/**
 * Cartão herói das Rações: o número que interessa é o que falta, não o que já
 * se comeu. O canto inferior direito cortado e a trama de pontos vêm do
 * protótipo — é a mesma linguagem do cartão de ordem do dia, noutra chave.
 */
function CaloriesHero({
  totals,
  targets,
  remaining,
}: {
  totals: DailyTotals
  targets: MacroTargets
  remaining: DailyTotals
}) {
  const { t, n } = useI18n()
  const over = totals.calories > targets.calories
  const headline = over ? n(totals.calories - targets.calories) : n(remaining.calories)
  const pct = targets.calories > 0 ? Math.min(100, (totals.calories / targets.calories) * 100) : 0

  return (
    <section
      className="relative overflow-hidden border border-ember/40 px-[22px] pt-6 pb-5 shadow-[0_20px_60px_-22px_rgba(255,122,26,.45)] [clip-path:polygon(0_0,100%_0,100%_calc(100%-26px),calc(100%-26px)_100%,0_100%)]"
      style={{ background: 'linear-gradient(165deg,#181820,#0d0d13)' }}
    >
      <div
        className="pointer-events-none absolute top-0 right-0 h-[150px] w-[200px] opacity-35"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,122,26,.9) 1px, transparent 1.4px)',
          backgroundSize: '7px 7px',
          maskImage: 'linear-gradient(215deg, rgba(0,0,0,.95), transparent 68%)',
          WebkitMaskImage: 'linear-gradient(215deg, rgba(0,0,0,.95), transparent 68%)',
        }}
        aria-hidden="true"
      />

      <p className="relative text-[10.5px] font-bold tracking-[0.24em] text-ember-soft">
        {over ? t.nutrition.overHeading : t.nutrition.remainingHeading}
      </p>
      <p className="relative mt-2 flex items-baseline gap-2.5">
        <span className="font-display text-[74px] leading-[0.86] font-bold tabular-nums text-ink [text-shadow:5px_5px_0_rgba(184,18,54,.5)]">
          {headline}
        </span>
        <span className="text-[15px] text-ink-muted">{t.units.kcal}</span>
      </p>
      <p className="relative mt-2.5 text-[12.5px] text-ink-muted">
        {t.nutrition.ofGoal(n(totals.calories), `${n(targets.calories)} ${t.units.kcal}`)} ·{' '}
        {remaining.proteinG > 0 ? t.nutrition.proteinGap(Math.round(remaining.proteinG)) : t.nutrition.proteinMet}
      </p>
      <div className="relative mt-4 h-1 bg-void-700">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-crimson to-ember shadow-[0_0_14px_rgba(255,122,26,.85)]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </section>
  )
}

/** Um dos três macros, em cartão próprio com a sua barra. */
function MacroCard({
  label,
  value,
  target,
  labelClass,
  barClass,
}: {
  label: string
  value: number
  target: number
  labelClass: string
  barClass: string
}) {
  const { n } = useI18n()
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0

  return (
    <div className="rounded-[14px] border border-void-600 bg-void-800 px-3 py-[13px]">
      <p className={cn('text-[10.5px] font-semibold', labelClass)}>{label}</p>
      <p className="mt-[5px] font-display text-[22px] leading-none font-bold tabular-nums text-ink">
        {n(value)}
        <span className="text-xs text-ink-muted">/{n(target)}</span>
      </p>
      <div className="mt-[9px] h-[5px] rounded-full bg-void-700">
        <div className={cn('h-full rounded-full', barClass)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

/** Hidratação: o único bloco do ecrã em azul-espectral. */
function WaterCard() {
  const { t, d } = useI18n()
  const addWater = useNutritionStore((state) => state.addWater)
  const waterByDate = useNutritionStore((state) => state.waterByDate)
  const water = waterByDate[today()] ?? 0
  const pct = Math.min(100, (water / WATER_GOAL_ML) * 100)

  return (
    <section className="mt-3.5 rounded-2xl border border-spirit/[0.32] bg-spirit/5 p-3.5">
      <div className="flex items-end justify-between gap-2.5">
        <div>
          <p className="text-[10.5px] font-bold tracking-[0.16em] text-spirit">{t.nutrition.hydrationCaption}</p>
          <p className="mt-[3px] font-display text-2xl leading-none font-bold tabular-nums text-spirit">
            {t.nutrition.ofGoal(t.common.litres(d(water / 1000, 2)), t.common.litres(d(WATER_GOAL_ML / 1000, 1)))}
          </p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          {[250, 500].map((ml) => (
            <button
              key={ml}
              type="button"
              onClick={() => addWater(ml)}
              // Registar água é dos gestos mais repetidos e faz-se de pé, no
              // ginásio: 34 px passam a 44 pt cheios, sem truques.
              className="h-11 rounded-[10px] border border-spirit/40 bg-spirit/10 px-3.5 text-[11.5px] font-semibold text-spirit transition-opacity active:opacity-90"
            >
              +{ml}
            </button>
          ))}
        </div>
      </div>
      <div
        className="mt-[11px] h-[5px] overflow-hidden rounded-full bg-void-700"
        role="progressbar"
        aria-valuenow={water}
        aria-valuemin={0}
        aria-valuemax={WATER_GOAL_ML}
        aria-label={t.nutrition.hydration}
      >
        <div className="h-full rounded-full bg-spirit" style={{ width: `${pct}%` }} />
      </div>
    </section>
  )
}

/**
 * Registos de uma refeição agrupados por fotografia.
 *
 * Uma foto analisada dá origem a vários registos — um por alimento — e todos
 * partilham o mesmo `photoGroupId`. Sem isto o diário mostrava a imagem só à
 * frente do primeiro alimento e os restantes apareciam soltos, como se não
 * tivessem vindo dali.
 */
interface EntryGroup {
  key: string
  entries: MealEntry[]
  photo?: string
}

function groupEntries(entries: MealEntry[]): EntryGroup[] {
  const groups: EntryGroup[] = []
  const byPhoto = new Map<string, EntryGroup>()
  for (const entry of entries) {
    if (!entry.photoGroupId) {
      // Registos manuais (e os anteriores ao agrupamento) ficam sozinhos.
      groups.push({ key: entry.id, entries: [entry], photo: entry.photo })
      continue
    }
    const existing = byPhoto.get(entry.photoGroupId)
    if (existing) {
      existing.entries.push(entry)
      // A miniatura está guardada num só membro do grupo.
      existing.photo ??= entry.photo
      continue
    }
    const group: EntryGroup = { key: entry.photoGroupId, entries: [entry], photo: entry.photo }
    byPhoto.set(entry.photoGroupId, group)
    groups.push(group)
  }
  return groups
}

function EntryRow({ entry, onRemove }: { entry: MealEntry; onRemove: () => void }) {
  const { t, n, loc } = useI18n()
  const food = foodForEntry(entry)
  const macros = entryMacros(entry)
  const foodName = food ? loc(food.name) : entry.foodId

  return (
    // `py-1.5` põe a linha nos 41 px; com os 8 px de intervalo entre linhas, as
    // áreas de toque de dois «×» consecutivos (44 pt cada) ficam a 49 px de
    // distância e não se sobrepõem — senão apagava-se o registo errado.
    <div className="flex items-center gap-2.5 py-1.5">
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12.5px] text-ink">{foodName}</span>
        <span className="mt-px block truncate text-[10.5px] text-ink-muted">
          {t.nutrition.entryMacros(entry.grams, macros.proteinG, macros.carbsG, macros.fatG)}
        </span>
      </span>
      <span className="shrink-0 font-display text-[15px] font-bold tabular-nums text-ember-soft">
        {n(macros.calories)}
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={t.nutrition.removeAria(foodName)}
        // Apagar um registo é a ação destrutiva mais frequente da app e tinha
        // 24 px de alvo. O desenho mantém-se; o alvo vai aos 44 pt.
        className="tap-target flex size-6 shrink-0 items-center justify-center rounded-[7px] bg-void-700 text-ink-muted active:opacity-90"
      >
        <Icon name="X" size={11} />
      </button>
    </div>
  )
}

export function NutritionPage() {
  const { t, n, lang, loc } = useI18n()
  const profile = useUserStore((state) => state.profile)
  const targets = useUserStore((state) => state.targets)
  const entries = useNutritionStore((state) => state.entries)
  const entriesForDate = useNutritionStore((state) => state.entriesForDate)
  const totalsForDate = useNutritionStore((state) => state.totalsForDate)
  const removeEntry = useNutritionStore((state) => state.removeEntry)
  const addEntry = useNutritionStore((state) => state.addEntry)

  const [adding, setAdding] = useState<MealType | null>(null)
  const [photoLogging, setPhotoLogging] = useState<MealType | null>(null)

  const date = today()
  const todayEntries = useMemo(() => entriesForDate(date), [entriesForDate, date, entries])
  const totals = useMemo(() => totalsForDate(date), [totalsForDate, date, entries])
  const remaining = remainingMacros(totals, targets)

  const diet = profile?.dietPreference ?? 'sem_preferencia'
  const suggestions = useMemo(() => suggestMeals(remaining, diet, t, lang), [remaining, diet, t, lang])
  // Oito alimentos do catálogo para registo de um toque, sem abrir o modal.
  const quickFoods = useMemo(() => searchFoods('', diet, lang).slice(0, 8), [diet, lang])

  if (!targets) return null

  const overTarget = totals.calories > targets.calories * 1.05

  return (
    <>
      <ScreenBackdrop screen="racoes" />

      <ScreenHeader>
        <ScreenTitle>{t.nutrition.todayLabel}</ScreenTitle>
        <HeaderAction icon="Camera" onClick={() => setPhotoLogging('almoco')}>
          {t.nutrition.photoOrCode}
        </HeaderAction>
      </ScreenHeader>

      <div className="hidden flex-wrap items-end justify-between gap-4 md:flex">
        <div>
          <h1 className="slash-divider font-display text-3xl font-bold text-ink">{t.nutrition.title}</h1>
          <p className="mt-3.5 text-sm text-ink-muted">
            {t.nutrition.remainingOf(n(remaining.calories), n(targets.calories))}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon="Camera" onClick={() => setPhotoLogging('almoco')}>
            {t.photoLog.title}
          </Button>
          <Button variant="primary" icon="Plus" onClick={() => setAdding('almoco')}>
            {t.nutrition.logMeal}
          </Button>
        </div>
      </div>

      <div className="px-5 pt-3 md:mt-6 md:px-0 md:pt-0">
        <CaloriesHero totals={totals} targets={targets} remaining={remaining} />

        <div className="mt-3.5 grid grid-cols-3 gap-2">
          <MacroCard
            label={t.macros.protein}
            value={totals.proteinG}
            target={targets.proteinG}
            labelClass="text-ember-soft"
            barClass="bg-ember"
          />
          <MacroCard
            label={t.macros.carbs}
            value={totals.carbsG}
            target={targets.carbsG}
            labelClass="text-crimson-soft"
            barClass="bg-crimson-soft"
          />
          <MacroCard
            label={t.macros.fat}
            value={totals.fatG}
            target={targets.fatG}
            labelClass="text-gold-soft"
            barClass="bg-gold"
          />
        </div>

        {overTarget && (
          <div className="mt-3 flex items-center gap-[9px] rounded-[13px] border border-warn/45 bg-warn/[0.08] px-[13px] py-[11px]">
            <Icon name="AlertTriangle" size={13} className="shrink-0 text-warn" />
            <span className="text-[11.5px] leading-[1.45] text-warn">{t.nutrition.overTarget}</span>
          </div>
        )}

        <WaterCard />

        {/* Sugestões */}
        <section className="mt-3.5 rounded-2xl border border-ember/30 bg-ember/5 p-3.5">
          <div className="flex items-center gap-[9px]">
            <ArtIcon name="spark-spirit" size={18} className="shrink-0 text-ember-soft" />
            <p className="text-[10.5px] font-bold tracking-[0.16em] text-ember-soft">
              {t.nutrition.suggestionsCaption}
            </p>
          </div>

          {suggestions.message ? (
            <p className="mt-2.5 text-[12.5px] leading-[1.5] text-ink">{suggestions.message}</p>
          ) : (
            <>
              <p className="mt-2.5 text-xs font-semibold text-ember-soft">{suggestions.suggestions[0]?.headline}</p>
              <div className="mt-2.5 flex flex-col gap-1.5">
                {suggestions.suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="flex items-center justify-between gap-2.5 rounded-[11px] border border-void-600 bg-void-800 px-3 py-2.5"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[12.5px] text-ink">{suggestion.detail}</span>
                      <span className="mt-px block truncate text-[10.5px] text-ink-muted">
                        {suggestion.foodIds
                          .map((id) => {
                            const item = getFood(id)
                            return item ? loc(item.name) : null
                          })
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    </span>
                    <span className="flex shrink-0 gap-[5px]">
                      <span className="rounded-[5px] bg-ember/[0.14] px-[7px] py-[3px] text-[10px] font-bold text-ember-soft">
                        {n(suggestion.totals.calories)} {t.units.kcal}
                      </span>
                      <span className="rounded-[5px] bg-void-700 px-[7px] py-[3px] text-[10px] font-bold text-ink">
                        P {suggestion.totals.proteinG} {t.units.grams}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
          <p className="mt-2.5 text-[10px] leading-[1.5] text-ink-muted">{t.disclaimer.suggestions}</p>
        </section>

        {/* Diário por refeição */}
        <section className="mt-[18px]">
          <span className="text-[10.5px] font-semibold tracking-[0.16em] text-ink-muted">
            {t.nutrition.diaryHeading(todayEntries.length)}
          </span>

          {MEAL_ORDER.map((meal) => {
            const mealEntries = todayEntries.filter((entry) => entry.mealType === meal)
            const mealTotal = mealEntries.reduce((sum, entry) => sum + entryMacros(entry).calories, 0)

            return (
              <div key={meal} className="mt-3.5">
                <div className="flex items-center justify-between gap-2.5">
                  <span className="text-[12.5px] font-semibold text-ink">{t.meals[meal]}</span>
                  <span className="flex items-center gap-[9px]">
                    <span className="font-display text-sm font-semibold tabular-nums text-ink-muted">
                      {n(mealTotal)} {t.units.kcal}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAdding(meal)}
                      aria-label={t.nutrition.addToMeal(t.meals[meal])}
                      className="tap-target flex size-[26px] items-center justify-center rounded-lg border border-void-600 bg-void-800 text-ember active:opacity-90"
                    >
                      <Icon name="Plus" size={14} />
                    </button>
                  </span>
                </div>

                {mealEntries.length === 0 ? (
                  <p className="mt-[7px] text-[11px] text-ink-muted">{t.nutrition.noEntries}</p>
                ) : (
                  <div className="mt-2 flex flex-col gap-1.5">
                    {groupEntries(mealEntries).map((group) => (
                      <div
                        key={group.key}
                        className="flex items-start gap-2.5 rounded-[11px] border border-void-700 bg-void-800 px-3 py-2.5"
                      >
                        {group.photo && (
                          <img
                            src={group.photo}
                            alt={t.photoLog.photoAlt}
                            className="size-10 shrink-0 rounded-lg border border-void-600 object-cover"
                          />
                        )}
                        <div className="min-w-0 flex-1 space-y-2">
                          {group.entries.length > 1 && (
                            <p className="text-[10.5px] text-ink-muted">{t.nutrition.photoGroup(group.entries.length)}</p>
                          )}
                          {group.entries.map((entry) => (
                            <EntryRow key={entry.id} entry={entry} onRemove={() => removeEntry(entry.id)} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </section>

        {/* Registo rápido: a porção habitual do catálogo, num toque. */}
        <section className="mt-5">
          <span className="text-[10.5px] font-semibold tracking-[0.16em] text-ink-muted">
            {t.nutrition.quickLog(t.meals.almoco)}
          </span>
          <div className="mt-2.5 flex flex-col border-t border-void-700">
            {quickFoods.map((food) => (
              <button
                key={food.id}
                type="button"
                onClick={() => {
                  addEntry('almoco', food, food.commonPortionG)
                  checkProteinBonus(targets)
                }}
                className="flex items-center justify-between gap-2.5 border-b border-void-700 py-[11px] text-left"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[12.5px] text-ink">{loc(food.name)}</span>
                  <span className="mt-px block truncate text-[10.5px] text-ink-muted">{loc(food.portionLabel)}</span>
                </span>
                <span className="flex shrink-0 items-center gap-[9px]">
                  <span className="font-display text-[15px] font-bold tabular-nums text-ember-soft">
                    {n(Math.round((food.per100g.calories * food.commonPortionG) / 100))}
                  </span>
                  <span className="flex size-6 items-center justify-center rounded-lg bg-ember/[0.14] text-ember">
                    <Icon name="Plus" size={14} />
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <p className="mt-4 text-[10px] leading-[1.55] text-ink-muted">{t.disclaimer.foodValues}</p>
      </div>

      <AddFoodModal open={adding !== null} mealType={adding ?? 'almoco'} onClose={() => setAdding(null)} />
      <PhotoLogModal
        open={photoLogging !== null}
        mealType={photoLogging ?? 'almoco'}
        onClose={() => setPhotoLogging(null)}
      />
    </>
  )
}

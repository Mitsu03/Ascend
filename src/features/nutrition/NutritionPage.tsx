import { useEffect, useMemo, useState } from 'react'
import { getFood, searchFoods } from '@/data/foods'
import { Button, IconButton } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge, Disclaimer, EmptyState, Field, SearchInput, Select, TextInput } from '@/components/ui/Misc'
import { MacroBar, ProgressRing } from '@/components/ui/Progress'
import { Modal } from '@/components/ui/Modal'
import { PhotoLogModal } from '@/features/nutrition/PhotoLogModal'
import { useI18n } from '@/i18n'
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
import type { Food, MealType } from '@/types'

const WATER_GOAL_ML = 2500

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
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-ink-muted">
            {preview ? t.nutrition.preview(n(preview.calories), preview.proteinG) : t.nutrition.pickFood}
          </span>
          <div className="flex gap-2">
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
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">{loc(item.name)}</span>
                  <span className="text-xs text-ink-faint">{loc(item.portionLabel)}</span>
                </span>
                <Badge tone="neutral">{t.foodCategories[item.category]}</Badge>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-ember">
                  {item.per100g.calories} {t.units.kcal}
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

function WaterCard() {
  const { t, d } = useI18n()
  const addWater = useNutritionStore((state) => state.addWater)
  const waterByDate = useNutritionStore((state) => state.waterByDate)
  const water = waterByDate[today()] ?? 0

  return (
    <Card>
      <CardHeader
        title={t.nutrition.hydration}
        subtitle={t.nutrition.suggestedGoal(d(WATER_GOAL_ML / 1000, 1))}
        icon="Droplets"
      />
      <CardBody className="space-y-3 pt-3">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-4xl font-bold tabular-nums text-ember">
            {d(water / 1000, 2)}
          </span>
          <span className="text-ink-muted">{t.nutrition.litresToday}</span>
        </div>
        <MacroBar
          label={t.nutrition.progress}
          value={water}
          target={WATER_GOAL_ML}
          unit={t.units.ml}
          tone="ember"
        />
        <div className="flex gap-2">
          <Button size="sm" icon="Plus" onClick={() => addWater(250)}>
            250 {t.units.ml}
          </Button>
          <Button size="sm" icon="Plus" onClick={() => addWater(500)}>
            500 {t.units.ml}
          </Button>
        </div>
      </CardBody>
    </Card>
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

  const [adding, setAdding] = useState<MealType | null>(null)
  const [photoLogging, setPhotoLogging] = useState<MealType | null>(null)
  const [logMode, setLogMode] = useState<'foto' | 'texto'>('foto')

  const date = today()
  const todayEntries = useMemo(() => entriesForDate(date), [entries, entriesForDate, date])
  const totals = useMemo(() => totalsForDate(date), [entries, totalsForDate, date])
  const remaining = remainingMacros(totals, targets)

  const suggestions = useMemo(
    () => suggestMeals(remaining, profile?.dietPreference ?? 'sem_preferencia', t, lang),
    [remaining, profile?.dietPreference, t, lang],
  )

  if (!targets) return null

  const overTarget = totals.calories > targets.calories * 1.05

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="slash-divider text-3xl font-bold text-ink">{t.nutrition.title}</h1>
          <p className="mt-3 text-ink-muted">{t.nutrition.remainingOf(n(remaining.calories), n(targets.calories))}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            icon="Camera"
            onClick={() => {
              setLogMode('foto')
              setPhotoLogging('almoco')
            }}
          >
            {t.photoLog.photographMeal}
          </Button>
          <Button
            variant="secondary"
            icon="Pencil"
            onClick={() => {
              setLogMode('texto')
              setPhotoLogging('almoco')
            }}
          >
            {t.photoLog.describeMeal}
          </Button>
          <Button variant="primary" icon="Plus" onClick={() => setAdding('almoco')}>
            {t.nutrition.logMeal}
          </Button>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <Card>
          <CardHeader
            title={t.nutrition.daySummary}
            subtitle={t.nutrition.caloriesAndMacros}
            icon="UtensilsCrossed"
          />
          <CardBody className="pt-3">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <ProgressRing
                value={totals.calories}
                max={targets.calories}
                size={160}
                tone={overTarget ? 'warn' : 'ember'}
                label={`${n(totals.calories)} / ${n(targets.calories)} ${t.units.kcal}`}
              >
                <span className="font-display text-4xl font-bold tabular-nums text-ink">{n(totals.calories)}</span>
                <span className="text-xs text-ink-muted">
                  {t.common.of} {n(targets.calories)} {t.units.kcal}
                </span>
              </ProgressRing>
              <div className="w-full flex-1 space-y-4">
                <MacroBar label={t.macros.protein} value={totals.proteinG} target={targets.proteinG} tone="ember" />
                <MacroBar label={t.macros.carbs} value={totals.carbsG} target={targets.carbsG} tone="crimson" />
                <MacroBar label={t.macros.fat} value={totals.fatG} target={targets.fatG} tone="gold" />
                {overTarget && (
                  <Badge tone="warn" icon="AlertTriangle">
                    {t.nutrition.overTarget}
                  </Badge>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        <WaterCard />
      </div>

      <Card>
        <CardHeader title={t.nutrition.suggestions} subtitle={t.nutrition.suggestionsSubtitle} icon="Sparkles" />
        <CardBody className="space-y-3 pt-3">
          {suggestions.message ? (
            <p className="rounded-xl border border-good/35 bg-good/5 p-4 text-sm leading-relaxed text-ink">
              {suggestions.message}
            </p>
          ) : (
            <>
              <p className="text-sm font-medium text-ember">{suggestions.suggestions[0]?.headline}</p>
              <ul className="space-y-2">
                {suggestions.suggestions.map((suggestion) => (
                  <li
                    key={suggestion.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-void-600 bg-void-800/50 p-3.5"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-ink">{suggestion.detail}</p>
                      <p className="mt-0.5 text-xs text-ink-faint">
                        {suggestion.foodIds
                          .map((id) => {
                            const item = getFood(id)
                            return item ? loc(item.name) : null
                          })
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Badge tone="ember">
                        {n(suggestion.totals.calories)} {t.units.kcal}
                      </Badge>
                      <Badge tone="neutral">
                        P {suggestion.totals.proteinG} {t.units.grams}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
          <Disclaimer>{t.disclaimer.suggestions}</Disclaimer>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title={t.nutrition.diary}
          subtitle={t.nutrition.entriesCount(todayEntries.length)}
          icon="ListChecks"
        />
        <CardBody className="space-y-4 pt-3">
          {todayEntries.length === 0 && (
            <EmptyState
              icon="UtensilsCrossed"
              title={t.nutrition.emptyTitle}
              message={t.nutrition.emptyText}
              action={
                <Button variant="primary" icon="Plus" onClick={() => setAdding('pequeno_almoco')}>
                  {t.nutrition.logMeal}
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
                  <h3 className="text-sm font-semibold text-ink">{t.meals[meal]}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs tabular-nums text-ink-muted">
                      {n(mealTotal)} {t.units.kcal}
                    </span>
                    <IconButton
                      icon="Plus"
                      label={t.nutrition.addToMeal(t.meals[meal])}
                      size="sm"
                      onClick={() => setAdding(meal)}
                    />
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {mealEntries.map((entry) => {
                    const food = foodForEntry(entry)
                    const macros = entryMacros(entry)
                    const foodName = food ? loc(food.name) : entry.foodId
                    return (
                      <li
                        key={entry.id}
                        className="flex items-center gap-3 rounded-xl border border-void-600 bg-void-800/40 p-3"
                      >
                        {entry.photo && (
                          <img
                            src={entry.photo}
                            alt={t.photoLog.photoAlt}
                            className="size-11 shrink-0 rounded-lg border border-void-600 object-cover"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink">{foodName}</p>
                          <p className="text-xs text-ink-faint">
                            {t.nutrition.entryMacros(entry.grams, macros.proteinG, macros.carbsG, macros.fatG)}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-semibold tabular-nums text-ember">
                          {n(macros.calories)} {t.units.kcal}
                        </span>
                        <IconButton
                          icon="Trash2"
                          label={t.nutrition.removeAria(foodName)}
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
            <div className="flex flex-wrap gap-2 border-t border-void-700 pt-4">
              {MEAL_ORDER.map((meal) => (
                <Button key={meal} size="sm" icon="Plus" onClick={() => setAdding(meal)}>
                  {t.meals[meal]}
                </Button>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <p className="flex items-start gap-2 text-xs leading-relaxed text-ink-faint">
        <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
        {t.disclaimer.foodValues}
      </p>

      <AddFoodModal open={adding !== null} mealType={adding ?? 'almoco'} onClose={() => setAdding(null)} />
      <PhotoLogModal
        open={photoLogging !== null}
        mealType={photoLogging ?? 'almoco'}
        initialMode={logMode}
        onClose={() => setPhotoLogging(null)}
      />
    </div>
  )
}

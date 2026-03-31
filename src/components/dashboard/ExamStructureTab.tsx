'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Pencil, Trash2, Save, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { quizService } from '@/features/quiz/quiz.service'
import type { ExamConfig } from '@/types/quiz'

/**
 * Cấu trúc đề thi — UI theo Figma DSAT (node-id=463-7631).
 * Logic theo He_thong_danh_gia_nang_luc_so.md:
 * - 2 chế độ: Chuẩn (60 câu/30p) và Tùy chỉnh (Dynamic Matrix).
 * - 6 miền năng lực × 4 mức độ khó.
 * - Công thức: Score_level_i = P_trac_nghiem * W_i / sum(N_j * W_j).
 * - Tự luận: Điểm thực tế = Tổng điểm tự luận × Tỷ lệ %.
 */

const SKILL_AREAS = [
  'KHAI THÁC DỮ LIỆU VÀ THÔNG TIN',
  'GIAO TIẾP VÀ HỢP TÁC TRONG MÔI TRƯỜNG SỐ',
  'SÁNG TẠO NỘI DUNG SỐ',
  'AN TOÀN TRONG MÔI TRƯỜNG SỐ',
  'GIẢI QUYẾT VẤN ĐỀ TRONG MÔI TRƯỜNG SỐ',
  'ỨNG DỤNG TRÍ TUỆ NHÂN TẠO (AI)',
]

const LEVEL_LABELS = ['Mức 1', 'Mức 2', 'Mức 3', 'Mức 4']

/** Ma trận chuẩn: 6 miền × 4 mức, mỗi miền 10 câu, cột 20-20-10-10 */
const STANDARD_MATRIX: [string, string, string, string][] = [
  ['4', '4', '1', '1'],
  ['4', '4', '1', '1'],
  ['3', '3', '2', '2'],
  ['3', '3', '2', '2'],
  ['3', '3', '2', '2'],
  ['3', '3', '2', '2'],
]

const STANDARD_WEIGHTS = { level1: 1, level2: 1.5, level3: 2, level4: 3 }

type DistributionRow = [string, string, string, string]
type ExamMode = 'standard' | 'dynamic'

interface PracticalQuestion {
  id: string
  name: string
  level: string
  ratioPercent: number
  actualScore: number
}

const CARD_HEADER_CLASS =
  'rounded-t-2xl border-b border-[#D0E5F7] bg-[#E8F4FF] px-6 py-4 text-base font-semibold text-main'

function Card({
  title,
  children,
  className = '',
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm ${className}`}>
      <div className={CARD_HEADER_CLASS}>{title}</div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function parseRow(row: DistributionRow): [number, number, number, number] {
  return [
    parseInt(row[0], 10) || 0,
    parseInt(row[1], 10) || 0,
    parseInt(row[2], 10) || 0,
    parseInt(row[3], 10) || 0,
  ]
}

export default function ExamStructureTab() {
  const queryClient = useQueryClient()
  const [examMode, setExamMode] = useState<ExamMode>('standard')
  const [editMcq, setEditMcq] = useState(false)
  const [editPractical, setEditPractical] = useState(false)
  const [generalConfig, setGeneralConfig] = useState({
    totalMultipleChoice: 600,
    totalEssay: 400,
    durationMinutes: 30,
  })
  const [weightConfig, setWeightConfig] = useState(STANDARD_WEIGHTS)
  const [distribution, setDistribution] = useState<Record<string, DistributionRow>>(
    () =>
      Object.fromEntries(
        SKILL_AREAS.map((area, i) => [area, [...STANDARD_MATRIX[i]]])
      )
  )
  const [practicalQuestions, setPracticalQuestions] = useState<PracticalQuestion[]>([
    { id: '1', name: 'Câu 1', level: 'Mức Vận dụng', ratioPercent: 40, actualScore: 160 },
    { id: '2', name: 'Câu 2', level: 'Mức Sáng tạo', ratioPercent: 60, actualScore: 240 },
  ])

  // Track the config currently loaded from the server
  const [selectedConfigId, setSelectedConfigId] = useState<number | null>(null)
  const [configName, setConfigName] = useState('Đề chuẩn')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const saveStatusTimeout = useRef<NodeJS.Timeout | null>(null)

  // Load existing configs from API
  const { data: existingConfigs = [] } = useQuery<ExamConfig[]>({
    queryKey: ['exam-configs'],
    queryFn: quizService.getExamConfigs,
  })

  // Populate local state from the first active config (runs once when configs arrive)
  const configsApplied = useRef(false)
  useEffect(() => {
    if (configsApplied.current || existingConfigs.length === 0) return
    configsApplied.current = true
    const active = existingConfigs.find((c) => c.isActive) ?? existingConfigs[0]
    if (!active) return
    setSelectedConfigId(active.id)
    setConfigName(active.name)
    setExamMode(active.examMode)
    setGeneralConfig(active.generalConfig)
    setWeightConfig(active.weights)
    setDistribution(active.distribution)
    setPracticalQuestions(active.practicalQuestions)
  }, [existingConfigs])

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const dto = {
        name: configName || 'Cấu hình đề thi',
        examMode,
        generalConfig,
        distribution,
        weights: weightConfig,
        practicalQuestions,
        isActive: true,
      }
      if (selectedConfigId != null) {
        return quizService.updateExamConfig(selectedConfigId, dto)
      }
      return quizService.createExamConfig(dto)
    },
    onSuccess: (saved) => {
      setSelectedConfigId(saved.id)
      queryClient.invalidateQueries({ queryKey: ['exam-configs'] })
      setSaveStatus('saved')
      if (saveStatusTimeout.current) clearTimeout(saveStatusTimeout.current)
      saveStatusTimeout.current = setTimeout(() => setSaveStatus('idle'), 3000)
    },
    onError: () => {
      setSaveStatus('error')
      if (saveStatusTimeout.current) clearTimeout(saveStatusTimeout.current)
      saveStatusTimeout.current = setTimeout(() => setSaveStatus('idle'), 3000)
    },
  })

  const isStandard = examMode === 'standard'

  const colTotals = useMemo((): [number, number, number, number] => {
    let c0 = 0, c1 = 0, c2 = 0, c3 = 0
    SKILL_AREAS.forEach((area) => {
      const row = distribution[area] ?? ['0', '0', '0', '0']
      const [a, b, c, d] = parseRow(row)
      c0 += a
      c1 += b
      c2 += c
      c3 += d
    })
    return [c0, c1, c2, c3]
  }, [distribution])

  const totalMcqQuestions = useMemo(
    () => colTotals[0] + colTotals[1] + colTotals[2] + colTotals[3],
    [colTotals]
  )

  const weights = useMemo(
    () => [
      weightConfig.level1,
      weightConfig.level2,
      weightConfig.level3,
      weightConfig.level4,
    ],
    [weightConfig]
  )

  const totalWeighted = useMemo(
    () =>
      colTotals[0] * weights[0] +
      colTotals[1] * weights[1] +
      colTotals[2] * weights[2] +
      colTotals[3] * weights[3],
    [colTotals, weights]
  )

  const pointsPerLevel = useMemo((): number[] => {
    if (totalWeighted <= 0)
      return [0, 0, 0, 0]
    const P = generalConfig.totalMultipleChoice
    return weights.map((w) => (P * w) / totalWeighted)
  }, [generalConfig.totalMultipleChoice, weights, totalWeighted])

  const totalScore = generalConfig.totalMultipleChoice + generalConfig.totalEssay

  useEffect(() => {
    const totalEssay = generalConfig.totalEssay
    setPracticalQuestions((prev) =>
      prev.map((q) => ({
        ...q,
        actualScore: Math.round((totalEssay * q.ratioPercent) / 100),
      }))
    )
  }, [generalConfig.totalEssay])

  const syncEssayFromRatio = (id: string, ratioPercent: number) => {
    const totalEssay = generalConfig.totalEssay
    setPracticalQuestions((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, ratioPercent, actualScore: Math.round((totalEssay * ratioPercent) / 100) }
          : p
      )
    )
  }

  const handleMcqCellChange = (area: string, colIndex: number, value: string) => {
    if (!editMcq || isStandard) return
    const sanitized = value.replace(/\D/g, '').slice(0, 2) || '0'
    setDistribution((prev) => {
      const row = prev[area] ?? ['0', '0', '0', '0']
      const next: DistributionRow = [...row]
      next[colIndex] = sanitized
      return { ...prev, [area]: next }
    })
  }

  const handleDeletePractical = (id: string) => {
    setPracticalQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  const rowTotal = (row: DistributionRow) =>
    parseRow(row).reduce((s, n) => s + n, 0)

  const essayTotalActual = practicalQuestions.reduce((s, q) => s + q.actualScore, 0)
  const essayRatioSum = practicalQuestions.reduce((s, q) => s + q.ratioPercent, 0)

  const switchToStandard = () => {
    setExamMode('standard')
    setGeneralConfig((c) => ({ ...c, durationMinutes: 30 }))
    setDistribution(
      Object.fromEntries(
        SKILL_AREAS.map((area, i) => [area, [...STANDARD_MATRIX[i]]])
      )
    )
    setWeightConfig(STANDARD_WEIGHTS)
    setEditMcq(false)
  }

  const switchToDynamic = () => {
    setExamMode('dynamic')
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Chế độ đề thi + Tên cấu hình + Nút lưu */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <span className="text-sm font-medium text-gray-700">Chế độ đề thi:</span>
        <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
          <button
            type="button"
            onClick={switchToStandard}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              isStandard
                ? 'bg-main text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Chuẩn (60 câu / 30p)
          </button>
          <button
            type="button"
            onClick={switchToDynamic}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              !isStandard
                ? 'bg-main text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Tùy chỉnh
          </button>
        </div>

        {/* Config name + save */}
        <div className="ml-auto flex items-center gap-3">
          <Input
            type="text"
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
            placeholder="Tên cấu hình..."
            className="h-9 w-44 rounded-lg border-gray-200 text-sm"
          />
          <Button
            type="button"
            size="sm"
            onClick={() => { setSaveStatus('saving'); saveMutation.mutate() }}
            disabled={saveMutation.isPending}
            className="h-9 gap-1.5 bg-main hover:bg-main/90 text-white"
          >
            {saveStatus === 'saved' ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Đã lưu
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {saveMutation.isPending ? 'Đang lưu...' : 'Lưu cấu hình'}
              </>
            )}
          </Button>
          {saveStatus === 'error' && (
            <span className="text-xs text-red-500">Lưu thất bại</span>
          )}
        </div>
      </div>

      {/* Row 1: Cấu hình chung + Trọng số độ khó — giống Figma */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Cấu hình chung">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-600">
                Tổng điểm trắc nghiệm
              </label>
              <Input
                type="number"
                value={generalConfig.totalMultipleChoice}
                onChange={(e) =>
                  setGeneralConfig((c) => ({
                    ...c,
                    totalMultipleChoice: Number(e.target.value) || 0,
                  }))
                }
                className="h-11 rounded-lg border border-gray-200 bg-[#F5F5F5] px-4 text-base font-medium text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-600">
                Tổng điểm tự luận
              </label>
              <Input
                type="number"
                value={generalConfig.totalEssay}
                onChange={(e) =>
                  setGeneralConfig((c) => ({
                    ...c,
                    totalEssay: Number(e.target.value) || 0,
                  }))
                }
                className="h-11 rounded-lg border border-gray-200 bg-[#F5F5F5] px-4 text-base font-medium text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-600">
                Thời gian làm bài (phút)
              </label>
              <Input
                type="number"
                value={generalConfig.durationMinutes}
                onChange={(e) =>
                  setGeneralConfig((c) => ({
                    ...c,
                    durationMinutes: Number(e.target.value) || 0,
                  }))
                }
                disabled={isStandard}
                className="h-11 rounded-lg border border-gray-200 bg-[#F5F5F5] px-4 text-base font-medium text-gray-900 placeholder:text-gray-400 disabled:opacity-70"
              />
              {isStandard && (
                <p className="mt-1 text-xs text-gray-500">Chế độ Chuẩn: 30 phút trắc nghiệm.</p>
              )}
            </div>
          </div>
        </Card>

        <Card title="Trọng số độ khó">
          <p className="mb-3 text-xs text-gray-500">
            Công thức: Điểm/câu mức i = (Tổng điểm TN × W_i) / Σ(N_j × W_j)
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { key: 'level1' as const, label: 'Cơ bản (Mức 1)' },
              { key: 'level2' as const, label: 'Trung cấp (Mức 2)' },
              { key: 'level3' as const, label: 'Nâng cao (Mức 3)' },
              { key: 'level4' as const, label: 'Chuyên sâu (Mức 4)' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="mb-1.5 block text-sm font-medium text-gray-600">
                  {label}
                </label>
                <Input
                  type="number"
                  step="0.5"
                  min={0}
                  value={weightConfig[key]}
                  onChange={(e) =>
                    setWeightConfig((c) => ({
                      ...c,
                      [key]: Number(e.target.value) || 0,
                    }))
                  }
                  disabled={isStandard}
                  className="h-11 rounded-lg border border-gray-200 bg-[#F5F5F5] px-4 text-base font-medium text-gray-900 disabled:opacity-70"
                />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Phần 1: Cấu hình Câu hỏi trắc nghiệm — Figma node 463-7631 */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#D0E5F7] bg-[#E8F4FF] px-6 py-4">
          <h2 className="text-lg font-semibold text-main">
            Phần 1: Cấu hình Câu hỏi trắc nghiệm
          </h2>
          {!isStandard && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditMcq((v) => !v)}
              className="h-9 rounded-lg border-[#0EA5E9] bg-[#E0F4FE] text-[#0EA5E9] hover:bg-[#BAE6FD] hover:text-[#0284C7]"
            >
              <Pencil className="h-4 w-4" />
              {editMcq ? 'Hoàn tất' : 'Chỉnh sửa'}
            </Button>
          )}
        </div>
        <div className="overflow-x-auto p-6">
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full min-w-[520px] text-sm" role="grid">
              <thead>
                <tr className="bg-main text-white">
                <th className="px-4 py-3 text-left font-semibold">Miền năng lực</th>
                {LEVEL_LABELS.map((l) => (
                  <th key={l} className="px-4 py-3 text-center font-semibold">
                    {l}
                  </th>
                ))}
                <th className="px-4 py-3 text-center font-semibold">Tổng</th>
              </tr>
            </thead>
            <tbody>
              {SKILL_AREAS.map((area, i) => {
                const row = distribution[area] ?? ['0', '0', '0', '0']
                const total = rowTotal(row)
                const canEdit = !isStandard && editMcq
                return (
                  <tr
                    key={area}
                    className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/80'}
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                      {area}
                    </td>
                    {[0, 1, 2, 3].map((colIndex) => (
                      <td key={colIndex} className="px-4 py-2 text-center">
                        {canEdit ? (
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={row[colIndex]}
                            onChange={(e) =>
                              handleMcqCellChange(area, colIndex, e.target.value)
                            }
                            className="mx-auto h-9 w-14 rounded-lg border-gray-300 px-2 py-1.5 text-center text-sm"
                          />
                        ) : (
                          <span className="font-medium text-gray-900">{row[colIndex]}</span>
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center font-semibold text-gray-900">
                      {total}
                    </td>
                  </tr>
                )
              })}
              <tr className="bg-main text-white">
                <td className="px-4 py-3 font-semibold">Tổng số câu</td>
                {colTotals.map((n, i) => (
                  <td key={i} className="px-4 py-3 text-center font-semibold">
                    {n}
                  </td>
                ))}
                <td className="px-4 py-3 text-center font-semibold">
                  {totalMcqQuestions}
                </td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* Phần 2: Cấu hình Câu hỏi Thực hành — Figma node 463-7631 */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#D0E5F7] bg-[#E8F4FF] px-6 py-4">
          <h2 className="text-lg font-semibold text-main">
            Phần 2: Cấu hình Câu hỏi Thực hành
          </h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEditPractical((v) => !v)}
            className="h-9 rounded-lg border-[#0EA5E9] bg-[#E0F4FE] text-[#0EA5E9] hover:bg-[#BAE6FD] hover:text-[#0284C7]"
          >
            <Pencil className="h-4 w-4" />
            {editPractical ? 'Hoàn tất' : 'Chỉnh sửa'}
          </Button>
        </div>
        <div className="overflow-x-auto p-6">
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full min-w-[400px] text-sm" role="grid">
            <thead>
              <tr className="bg-main text-white">
                <th className="px-4 py-3 text-left font-semibold">
                  Tên / Mức độ câu hỏi
                </th>
                <th className="px-4 py-3 text-center font-semibold">Tỷ lệ điểm</th>
                <th className="px-4 py-3 text-center font-semibold">Điểm thực tế</th>
                <th className="w-14 px-4 py-3 text-center font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {practicalQuestions.map((q, i) => (
                <tr
                  key={q.id}
                  className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/80'}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {q.name} ({q.level})
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-gray-900">
                    {editPractical ? (
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={q.ratioPercent}
                        onChange={(e) => {
                          const v = Number(e.target.value) || 0
                          syncEssayFromRatio(q.id, v)
                        }}
                        className="mx-auto h-9 w-20 rounded-lg border-gray-300 text-center text-sm"
                      />
                    ) : (
                      `${q.ratioPercent}%`
                    )}
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-gray-900">
                    {editPractical ? (
                      <Input
                        type="number"
                        value={q.actualScore}
                        onChange={(e) => {
                          const v = Number(e.target.value) || 0
                          setPracticalQuestions((prev) =>
                            prev.map((p) =>
                              p.id === q.id ? { ...p, actualScore: v } : p
                            )
                          )
                        }}
                        className="mx-auto h-9 w-24 rounded-lg border-gray-300 text-center text-sm"
                      />
                    ) : (
                      q.actualScore
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleDeletePractical(q.id)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600"
                      aria-label="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="bg-main text-white">
                <td className="px-4 py-3 font-semibold">Tổng</td>
                <td className="px-4 py-3 text-center font-semibold">
                  {essayRatioSum}%
                  {essayRatioSum !== 100 && (
                    <span className="ml-1 text-amber-200" title="Tổng tỷ lệ nên bằng 100%">
                      *
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center font-semibold">
                  {essayTotalActual}
                </td>
                <td className="px-4 py-3" />
              </tr>
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* Tổng điểm — Figma: 4 level cards + 3 summary cards, nền xanh đậm */}
      <div className="rounded-2xl border border-main bg-main p-6 text-white shadow-sm">
        <h3 className="mb-5 text-xl font-bold">
          Điểm theo Từng cấp độ Trắc nghiệm
        </h3>
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Cơ bản (Mức 1)', count: colTotals[0], pts: pointsPerLevel[0] },
            { label: 'Trung cấp (Mức 2)', count: colTotals[1], pts: pointsPerLevel[1] },
            { label: 'Nâng cao (Mức 3)', count: colTotals[2], pts: pointsPerLevel[2] },
            { label: 'Chuyên sâu (Mức 4)', count: colTotals[3], pts: pointsPerLevel[3] },
          ].map(({ label, count, pts }) => (
            <div
              key={label}
              className="rounded-xl bg-white p-5 text-gray-900 shadow-sm"
            >
              <p className="mb-1 text-sm font-medium text-gray-600">{label}</p>
              <p className="text-lg font-semibold text-main">
                {totalWeighted > 0 ? pts.toFixed(2) : '0.00'} điểm/ câu
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Số lượng {count} câu
              </p>
              <p className="mt-2 font-bold text-main">
                Tổng: {totalWeighted > 0 ? (pts * count).toFixed(1) : '0'}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-6 text-gray-900 shadow-sm">
            <p className="text-sm font-medium text-gray-600">
              Tổng điểm trắc nghiệm
            </p>
            <p className="mt-1 text-2xl font-bold text-main">
              {generalConfig.totalMultipleChoice}/{generalConfig.totalMultipleChoice}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Tổng số câu: {totalMcqQuestions} câu
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 text-gray-900 shadow-sm">
            <p className="text-sm font-medium text-gray-600">
              Tổng điểm tự luận
            </p>
            <p className="mt-1 text-2xl font-bold text-main">
              {essayTotalActual}/{generalConfig.totalEssay}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Tổng số câu: {practicalQuestions.length} câu
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 text-gray-900 shadow-sm">
            <p className="text-sm font-medium text-gray-600">Tổng điểm</p>
            <p className="mt-1 text-2xl font-bold text-main">
              {totalScore}/1000
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Dashboard from '@/views/Dashboard/index.vue'
import { createTestingPinia } from '@pinia/testing'
import { useConsensusStore } from '@/store/modules/consensus'
import * as analysisAPI from '@/api/analysis'
import ElementPlus, { ElSwitch, ElMessage } from 'element-plus'

// Mock API
vi.mock('@/api/analysis', () => ({
  getAlgorithmComparison: vi.fn(),
  getPerformanceLimits: vi.fn(),
}))

// Mock Element Plus Message
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      warning: vi.fn(),
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn()
    }
  }
})

describe('Dashboard/index.vue', () => {
  let wrapper: any
  
  beforeEach(() => {
    vi.clearAllMocks()
    ;(analysisAPI.getAlgorithmComparison as any).mockResolvedValue([
      { algorithm: 'A', data: [{ nodeCount: 10, tps: 1000 }] },
      { algorithm: 'B', data: [{ nodeCount: 10, tps: 800 }] }
    ])
    ;(analysisAPI.getPerformanceLimits as any).mockResolvedValue([])
  })

  const mountComponent = () => {
    return mount(Dashboard, {
      global: {
        plugins: [
          ElementPlus,
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              consensus: {
                algorithms: [
                  { id: 'A', displayName: 'Algo A', color: '#000' },
                  { id: 'B', displayName: 'Algo B', color: '#000' },
                  { id: 'C', displayName: 'Algo C', color: '#000' },
                  { id: 'D', displayName: 'Algo D', color: '#000' },
                  { id: 'E', displayName: 'Algo E', color: '#000' }
                ],
                comparisonIds: ['A', 'B'],
                isChartExpanded: false,
                isLoading: false
              },
              performance: { metrics: {}, history: [] },
              benchmark: { tasks: [] },
              node: { nodes: [] }
            },
            stubActions: true
          })
        ],
        stubs: {
          'el-icon': true,
          DashboardMetric: true,
          'el-dialog': {
            template: '<div><slot /><slot name="footer" /></div>',
            props: ['modelValue']
          },
          'el-popover': {
            template: '<div><slot name="reference" /><slot /></div>'
          }
        }
      }
    })
  }

  it('renders correctly', async () => {
    wrapper = mountComponent()
    expect(wrapper.exists()).toBe(true)
  })

  it('displays switches for algorithms', async () => {
    wrapper = mountComponent()
    await flushPromises()
    const switches = wrapper.findAll('.switch-item-popover')
    expect(switches.length).toBe(5)
    expect(switches[0].text()).toContain('Algo A')
  })

  it('updates "vs" title based on selection', async () => {
    wrapper = mountComponent()
    const store = useConsensusStore()
    store.comparisonIds = ['A', 'B', 'C']
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.vs-title').text()).toBe('Algo A vs Algo B vs Algo C')
  })

  it('toggles algorithm selection', async () => {
    wrapper = mountComponent()
    await flushPromises()
    const store = useConsensusStore()
    
    // Find the 3rd switch (index 2, 'C')
    const switchComp = wrapper.findAllComponents(ElSwitch)[2]
    
    // Use $emit to simulate v-model update
    await switchComp.vm.$emit('update:model-value', true)
    
    expect(store.toggleComparisonAlgorithm).toHaveBeenCalledWith('C')
  })

  it('shows modal when selecting 5th algorithm', async () => {
    wrapper = mountComponent()
    const store = useConsensusStore()
    store.comparisonIds = ['A', 'B', 'C', 'D']
    await wrapper.vm.$nextTick()
    
    // Try to select E (index 4)
    const switchComp = wrapper.findAllComponents(ElSwitch)[4]
    await switchComp.vm.$emit('update:model-value', true)
    
    expect(wrapper.vm.showConflictModal).toBe(true)
    expect(wrapper.vm.tempSelectedIds).toEqual(['A', 'B', 'C', 'D', 'E'])
  })

  it('confirms conflict resolution', async () => {
    wrapper = mountComponent()
    const store = useConsensusStore()
    wrapper.vm.showConflictModal = true
    wrapper.vm.tempSelectedIds = ['A', 'B', 'C', 'E'] // User removed D, kept E
    
    await wrapper.vm.confirmConflict()
    
    expect(store.setComparisonAlgorithms).toHaveBeenCalledWith(['A', 'B', 'C', 'E'])
    expect(wrapper.vm.showConflictModal).toBe(false)
  })

  it('prevents confirming > 4 in modal', async () => {
    wrapper = mountComponent()
    const store = useConsensusStore()
    wrapper.vm.showConflictModal = true
    wrapper.vm.tempSelectedIds = ['A', 'B', 'C', 'D', 'E'] 
    
    await wrapper.vm.confirmConflict()
    
    expect(ElMessage.warning).toHaveBeenCalledWith('最多只能选择 4 个算法')
    
    expect(store.setComparisonAlgorithms).not.toHaveBeenCalled()
    expect(wrapper.vm.showConflictModal).toBe(true)
  })

  it('reorders algorithms in modal', async () => {
    wrapper = mountComponent()
    wrapper.vm.showConflictModal = true
    wrapper.vm.tempSelectedIds = ['A', 'B']
    await wrapper.vm.$nextTick()
    
    // Move A down (index 0, button 1 is 'down')
    // Note: el-button might be rendered as button.el-button
    // Structure: .selected-item -> .item-actions -> el-button (up), el-button (down), el-button (close)
    const firstItemActions = wrapper.findAll('.selected-item')[0].find('.item-actions')
    const downBtn = firstItemActions.findAll('.el-button')[1] // 0=Up, 1=Down, 2=Close
    
    await downBtn.trigger('click')
    
    expect(wrapper.vm.tempSelectedIds).toEqual(['B', 'A'])
  })

  it('removes algorithm in modal', async () => {
     wrapper = mountComponent()
     wrapper.vm.showConflictModal = true
     wrapper.vm.tempSelectedIds = ['A', 'B']
     await wrapper.vm.$nextTick()
     
     // Remove A (index 0, button 2 is 'close')
     const firstItemActions = wrapper.findAll('.selected-item')[0].find('.item-actions')
     const removeBtn = firstItemActions.findAll('.el-button')[2]
     
     await removeBtn.trigger('click')
     
     expect(wrapper.vm.tempSelectedIds).toEqual(['B'])
  })

  it('toggles expand state', async () => {
    wrapper = mountComponent()
    const store = useConsensusStore()
    
    const buttons = wrapper.findAll('.header-actions .el-button')
    await buttons[1].trigger('click')
    expect(store.setChartExpanded).toHaveBeenCalledWith(true)
  })

  it('handles API failure gracefully', async () => {
    ;(analysisAPI.getAlgorithmComparison as any).mockRejectedValue(new Error('API Error'))
    const consoleSpy = vi.spyOn(console, 'warn')
    
    wrapper = mountComponent()
    await flushPromises() 
    
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Using fallback TPS data'))
  })
})

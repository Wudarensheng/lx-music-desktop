
declare namespace LX {
  namespace Dislike {
    interface DislikeMusicInfo {
      name: string
      singer: string
    }

    type DislikeRules = string

    // 高级规则类型
    type AdvancedRuleMatchType = 'song' | 'singer' | 'regex'

    // 规则动作类型
    type AdvancedRuleActionType = 'block' | 'replace' | 'reject'

    // 高级规则定义
    interface AdvancedRule {
      id: string
      matchType: AdvancedRuleMatchType
      pattern: string
      action: AdvancedRuleActionType
      replaceUrl?: string
      errorMessage?: string
      enabled: boolean
    }

    interface DislikeInfo {
      names: Set<string>
      musicNames: Set<string>
      singerNames: Set<string>
      rules: DislikeRules
      advancedRules: AdvancedRule[]
    }
  }
}

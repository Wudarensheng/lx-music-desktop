

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
      pattern: string  // 匹配模式（歌曲名、歌手名、正则表达式）
      action: AdvancedRuleActionType
      replaceUrl?: string  // 替换的URL（当action为replace时）
      errorMessage?: string  // 自定义错误信息（当action为reject时）
      enabled: boolean
    }

    interface DislikeInfo {
      names: Set<string>
      musicNames: Set<string>
      singerNames: Set<string>
      rules: DislikeRules
      // 高级规则
      advancedRules: AdvancedRule[]
    }
  }
}

    type DislikeRules = string

    interface DislikeInfo {
      // musicIds: Set<string>
      names: Set<string>
      musicNames: Set<string>
      singerNames: Set<string>
      // list: LX.Dislike.ListItem[]
      rules: DislikeRules
    }
  }
}

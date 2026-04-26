import { markRaw } from '@common/utils/vueTools'


import { dislikeInfo, dislikeRuleCount } from './state'
import { SPLIT_CHAR } from '@common/constants'

// 检查高级规则，返回匹配的规则（如果有）
export const checkAdvancedRules = (info: LX.Music.MusicInfo | LX.Download.ListItem): LX.Dislike.AdvancedRule | null => {
  if ('progress' in info) info = info.metadata.musicInfo
  const name = info.name?.toLocaleLowerCase().trim() ?? ''
  const singer = info.singer?.toLocaleLowerCase().trim() ?? ''

  for (const rule of dislikeInfo.advancedRules) {
    if (!rule.enabled) continue

    let matched = false
    switch (rule.matchType) {
      case 'song':
        matched = name.includes(rule.pattern.toLocaleLowerCase())
        break
      case 'singer':
        matched = singer.includes(rule.pattern.toLocaleLowerCase())
        break
      case 'regex':
        try {
          const regex = new RegExp(rule.pattern, 'i')
          matched = regex.test(name) || regex.test(singer)
        } catch (e) {
          console.warn('Invalid regex pattern:', rule.pattern)
        }
        break
    }

    if (matched) return rule
  }

  return null
}

export const hasDislike = (info: LX.Music.MusicInfo | LX.Download.ListItem) => {
  if ('progress' in info) info = info.metadata.musicInfo
  const name = info.name?.replaceAll(SPLIT_CHAR.DISLIKE_NAME, SPLIT_CHAR.DISLIKE_NAME_ALIAS).toLocaleLowerCase().trim() ?? ''
  const singer = info.singer?.replaceAll(SPLIT_CHAR.DISLIKE_NAME, SPLIT_CHAR.DISLIKE_NAME_ALIAS).toLocaleLowerCase().trim() ?? ''

  return dislikeInfo.musicNames.has(name) || dislikeInfo.singerNames.has(singer) ||
    dislikeInfo.names.has(`${name}${SPLIT_CHAR.DISLIKE_NAME}${singer}`)
}

export const initDislikeInfo = ({ musicNames, rules, names, singerNames, advancedRules }: LX.Dislike.DislikeInfo) => {
  dislikeInfo.names = markRaw(names)
  dislikeInfo.singerNames = markRaw(singerNames)
  dislikeInfo.musicNames = markRaw(musicNames)
  dislikeInfo.rules = rules
  dislikeInfo.advancedRules = advancedRules || []
  dislikeRuleCount.value = dislikeInfo.musicNames.size + dislikeInfo.singerNames.size + dislikeInfo.names.size + dislikeInfo.advancedRules.filter(r => r.enabled).length
}

const initNameSet = () => {
  dislikeInfo.names.clear()
  dislikeInfo.musicNames.clear()
  dislikeInfo.singerNames.clear()
  const list: string[] = []
  for (const item of dislikeInfo.rules.split('\n')) {
    if (!item) continue
    let [name, singer] = item.split(SPLIT_CHAR.DISLIKE_NAME)
    if (name) {
      name = name.replaceAll(SPLIT_CHAR.DISLIKE_NAME, SPLIT_CHAR.DISLIKE_NAME_ALIAS).toLocaleLowerCase().trim()
      if (singer) {
        singer = singer.replaceAll(SPLIT_CHAR.DISLIKE_NAME, SPLIT_CHAR.DISLIKE_NAME_ALIAS).toLocaleLowerCase().trim()
        const rule = `${name}${SPLIT_CHAR.DISLIKE_NAME}${singer}`
        dislikeInfo.names.add(rule)
        list.push(rule)
      } else {
        dislikeInfo.musicNames.add(name)
        list.push(name)
      }
    } else if (singer) {
      singer = singer.replaceAll(SPLIT_CHAR.DISLIKE_NAME, SPLIT_CHAR.DISLIKE_NAME_ALIAS).toLocaleLowerCase().trim()
      dislikeInfo.singerNames.add(singer)
      list.push(`${SPLIT_CHAR.DISLIKE_NAME}${singer}`)
    }
  }
  dislikeInfo.rules = Array.from(new Set(list)).join('\n')
  dislikeRuleCount.value = dislikeInfo.musicNames.size + dislikeInfo.singerNames.size + dislikeInfo.names.size
}

export const addDislikeInfo = (infos: LX.Dislike.DislikeMusicInfo[]) => {
  dislikeInfo.rules += '\n' + infos.map(info => `${info.name ?? ''}${SPLIT_CHAR.DISLIKE_NAME}${info.singer ?? ''}`).join('\n')
  initNameSet()
  return dislikeInfo.rules
}

export const overwirteDislikeInfo = (rules: string) => {
  dislikeInfo.rules = rules
  initNameSet()
  return dislikeInfo.rules
}

export const clearDislikeInfo = () => {
  dislikeInfo.rules = ''
  dislikeInfo.advancedRules = []
  initNameSet()
  return dislikeInfo.rules
}

// 高级规则管理
export const addAdvancedRule = (rule: LX.Dislike.AdvancedRule) => {
  dislikeInfo.advancedRules.push(rule)
  dislikeRuleCount.value = dislikeInfo.musicNames.size + dislikeInfo.singerNames.size + dislikeInfo.names.size + dislikeInfo.advancedRules.filter(r => r.enabled).length
  return dislikeInfo.advancedRules
}

export const updateAdvancedRule = (id: string, updates: Partial<LX.Dislike.AdvancedRule>) => {
  const index = dislikeInfo.advancedRules.findIndex(r => r.id === id)
  if (index !== -1) {
    dislikeInfo.advancedRules[index] = { ...dislikeInfo.advancedRules[index], ...updates }
    dislikeRuleCount.value = dislikeInfo.musicNames.size + dislikeInfo.singerNames.size + dislikeInfo.names.size + dislikeInfo.advancedRules.filter(r => r.enabled).length
  }
  return dislikeInfo.advancedRules
}

export const removeAdvancedRule = (id: string) => {
  const index = dislikeInfo.advancedRules.findIndex(r => r.id === id)
  if (index !== -1) {
    dislikeInfo.advancedRules.splice(index, 1)
    dislikeRuleCount.value = dislikeInfo.musicNames.size + dislikeInfo.singerNames.size + dislikeInfo.names.size + dislikeInfo.advancedRules.filter(r => r.enabled).length
  }
  return dislikeInfo.advancedRules
}

export const setAdvancedRules = (rules: LX.Dislike.AdvancedRule[]) => {
  dislikeInfo.advancedRules = rules
  dislikeRuleCount.value = dislikeInfo.musicNames.size + dislikeInfo.singerNames.size + dislikeInfo.names.size + dislikeInfo.advancedRules.filter(r => r.enabled).length
  return dislikeInfo.advancedRules
}


// export const updateDislikeInfo = (info: LX.Dislike.ListItem) => {
//   const targetInfo = dislikeInfo.list.find(i => i.id == info.id)
//   if (!targetInfo) return
//   targetInfo.name = info.name
//   targetInfo.singer = info.singer
//   initNameSet()
// }

// export const removeDislikeInfo = (ids: string[]) => {
//   for (const id of ids) {
//     dislikeInfo.list.splice(dislikeInfo.list.findIndex(info => info.id == id), 1)
//   }
//   initNameSet()
// }

// export const clearDislikeInfo = () => {
//   dislikeInfo.rules = ''
//   initNameSet()
// }


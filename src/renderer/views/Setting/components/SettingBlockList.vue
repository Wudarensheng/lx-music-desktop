<template lang="pug">
dt#block_list {{ $t('setting__block_list') }}
dd
  .gap-top
    base-checkbox(
      id="setting_block_list_replace_korean_music"
      :model-value="appSetting['player.isReplaceKoreanMusic']"
      :label="$t('setting__block_list_replace_korean_music')"
      @update:model-value="updateSetting({'player.isReplaceKoreanMusic': $event})")
    svg-icon(class="help-icon" name="help-circle-outline" :aria-label="$t('setting__block_list_replace_korean_music_tip')")

  //- 韩语替换URL设置
  .gap-top
    div(style="display: flex; align-items: center; gap: 8px;")
      span {{ $t('setting__block_list_replace_korean_music_url') }}:
      base-input(
        :model-value="appSetting['player.replaceKoreanMusicUrl']"
        style="flex: 1;"
        @update:model-value="updateSetting({'player.replaceKoreanMusicUrl': $event})"
      )
    .tip-text {{ $t('setting__block_list_replace_korean_music_url_tip') }}

  //- 高级规则管理
  .gap-top
    h3 {{ $t('setting__block_list_advanced_rules') }}

    //- 添加新规则
    .rule-form(style="margin-bottom: 16px; padding: 12px; border: 1px solid var(--color-primary-light-200-alpha-900); border-radius: 4px;")
      div(style="display: flex; gap: 8px; margin-bottom: 8px;")
        div(style="flex: 1;")
          span {{ $t('setting__block_list_rule_type') }}:
          select(v-model="newRule.matchType" style="width: 100%; margin-top: 4px;")
            option(value="song") {{ $t('setting__block_list_rule_type_song') }}
            option(value="singer") {{ $t('setting__block_list_rule_type_singer') }}
            option(value="regex") {{ $t('setting__block_list_rule_type_regex') }}
        div(style="flex: 2;")
          span {{ $t('setting__block_list_rule_pattern') }}:
          base-input(
            v-model="newRule.pattern"
            :placeholder="$t('setting__block_list_rule_pattern_tip')"
            style="width: 100%; margin-top: 4px;"
          )
      div(style="display: flex; gap: 8px; margin-bottom: 8px;")
        div(style="flex: 1;")
          span {{ $t('setting__block_list_rule_action') }}:
          select(v-model="newRule.action" style="width: 100%; margin-top: 4px;")
            option(value="block") {{ $t('setting__block_list_rule_action_block') }}
            option(value="replace") {{ $t('setting__block_list_rule_action_replace') }}
            option(value="reject") {{ $t('setting__block_list_rule_action_reject') }}
      div(v-if="newRule.action === 'replace'" style="margin-bottom: 8px;")
        span {{ $t('setting__block_list_rule_replace_url') }}:
        base-input(
          v-model="newRule.replaceUrl"
          :placeholder="$t('setting__block_list_rule_replace_url_tip')"
          style="width: 100%; margin-top: 4px;"
        )
      div(v-if="newRule.action === 'reject'" style="margin-bottom: 8px;")
        span {{ $t('setting__block_list_rule_error_message') }}:
        base-input(
          v-model="newRule.errorMessage"
          :placeholder="$t('setting__block_list_rule_error_message_tip')"
          style="width: 100%; margin-top: 4px;"
        )
      base-btn(:disabled="!newRule.pattern" @click="addRule") {{ $t('setting__block_list_add_rule') }}

    //- 规则列表
    .rules-list(v-if="advancedRules.length > 0")
      .rule-item(
        v-for="rule in advancedRules"
        :key="rule.id"
        style="padding: 8px; border-bottom: 1px solid var(--color-primary-light-200-alpha-900);"
      )
        div(style="display: flex; justify-content: space-between; align-items: center;")
          div
            base-checkbox(
              :model-value="rule.enabled"
              :label="`${getMatchTypeText(rule.matchType)}: ${rule.pattern}`"
              @update:model-value="toggleRule(rule.id, $event)"
            )
            div(style="font-size: 12px; color: var(--color-550); margin-left: 24px;")
              | {{ getActionText(rule.action) }}
              span(v-if="rule.action === 'replace' && rule.replaceUrl")  → {{ rule.replaceUrl }}
              span(v-if="rule.action === 'reject' && rule.errorMessage")  → {{ rule.errorMessage }}
          base-btn(
            size="small"
            style="color: var(--color-danger);"
            @click="deleteRule(rule.id)"
          ) {{ $t('setting__block_list_delete_rule') }}

    div(v-else style="color: var(--color-550); font-size: 12px;") 暂无规则
</template>

<script>
import { ref, onMounted } from '@common/utils/vueTools'
import { appSetting, updateSetting } from '@renderer/store/setting'
import { dislikeInfo, addAdvancedRule, removeAdvancedRule, updateAdvancedRule } from '@renderer/core/dislikeList'

export default {
  name: 'SettingBlockList',
  setup() {
    const advancedRules = ref([])

    const newRule = ref({
      matchType: 'song',
      pattern: '',
      action: 'block',
      replaceUrl: '',
      errorMessage: '',
    })

    const getMatchTypeText = (type) => {
      const texts = {
        song: window.i18n.t('setting__block_list_rule_type_song'),
        singer: window.i18n.t('setting__block_list_rule_type_singer'),
        regex: window.i18n.t('setting__block_list_rule_type_regex'),
      }
      return texts[type] || type
    }

    const getActionText = (action) => {
      const texts = {
        block: window.i18n.t('setting__block_list_rule_action_block'),
        replace: window.i18n.t('setting__block_list_rule_action_replace'),
        reject: window.i18n.t('setting__block_list_rule_action_reject'),
      }
      return texts[action] || action
    }

    const addRule = () => {
      if (!newRule.value.pattern) return
      const rule = {
        id: Date.now().toString(),
        matchType: newRule.value.matchType,
        pattern: newRule.value.pattern,
        action: newRule.value.action,
        replaceUrl: newRule.value.replaceUrl,
        errorMessage: newRule.value.errorMessage,
        enabled: true,
      }
      addAdvancedRule(rule)
      advancedRules.value = [...dislikeInfo.advancedRules]
      // 重置表单
      newRule.value = {
        matchType: 'song',
        pattern: '',
        action: 'block',
        replaceUrl: '',
        errorMessage: '',
      }
    }

    const deleteRule = (id) => {
      removeAdvancedRule(id)
      advancedRules.value = [...dislikeInfo.advancedRules]
    }

    const toggleRule = (id, enabled) => {
      updateAdvancedRule(id, { enabled })
      advancedRules.value = [...dislikeInfo.advancedRules]
    }

    onMounted(() => {
      advancedRules.value = [...dislikeInfo.advancedRules]
    })

    return {
      appSetting,
      updateSetting,
      advancedRules,
      newRule,
      getMatchTypeText,
      getActionText,
      addRule,
      deleteRule,
      toggleRule,
    }
  },
}
</script>
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
</template>

<script>
import { appSetting, updateSetting } from '@renderer/store/setting'

export default {
  name: 'SettingBlockList',
  setup() {
    return {
      appSetting,
      updateSetting,
    }
  },
}
</script>
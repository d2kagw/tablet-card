import {
  LovelaceCard,
  LovelaceCardConfig,
  LovelaceCardEditor
} from 'custom-card-helpers';

declare global {
  interface HTMLElementTagNameMap {
    'tablet-card-editor': LovelaceCardEditor;
    'hui-error-card': LovelaceCard;
  }
}

interface TabletCardColumn {
  cards: Array<LovelaceCardConfig>;
}

export interface TabletCardConfig extends LovelaceCardConfig {
  type: string;
  name?: string;
  show_warning?: boolean;
  show_error?: boolean;
  test_gui?: boolean;

  columns: Array<TabletCardColumn>;

  logo?: string;

  screensaver_time?: number;
  auto_refresh_time?: number;
}

export interface TabletNoticeCardConfig extends LovelaceCardConfig {
  icon?: string;
  label: string;
  color?: string;
  entity?: string;
  state?: string;
}
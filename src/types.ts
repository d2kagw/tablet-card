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

export interface TabletCardColumn {
  cards: LovelaceCardConfig[];
}

export interface TabletCardConfig extends LovelaceCardConfig {
  type: string;
  name?: string;

  columns: TabletCardColumn[];
  utility_cards: LovelaceCardConfig[];

  logo?: string;

  screensaver_timeout?: number;
  show_clock?: boolean;
}

export interface TabletClockCardConfig extends LovelaceCardConfig {
  frameless?: boolean;
}

export interface TabletNoticeCardConfig extends LovelaceCardConfig {
  icon?: string;
  label: string;
  color?: string;
  entity?: string;
  state?: string;
}
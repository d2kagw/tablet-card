/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  LitElement,
  html,
  customElement,
  property,
  CSSResult,
  TemplateResult,
  css,
  PropertyValues,
  internalProperty,
} from 'lit-element';
import {
  HomeAssistant,
  hasConfigOrEntityChanged,
  hasAction,
  ActionHandlerEvent,
  handleAction,
  LovelaceCardEditor,
  getLovelace,
  LovelaceCard,
} from 'custom-card-helpers'; // This is a community maintained npm module with common helper functions/types
import { hass, provideHass } from "card-tools/src/hass";
import './editor';

import type { TabletCardConfig } from './types';
import { actionHandler } from './action-handler-directive';
import { CARD_VERSION } from './const';
import { localize } from './localize/localize';

/* eslint no-console: 0 */
console.info(
  `%c  tablet-card \n%c  ${localize('common.version')} ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

// This puts your card into the UI card picker dialog
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'tablet-card',
  name: 'Tablet Card',
  description: 'A template custom card for you to create something awesome',
});

// TODO Name your custom element
@customElement('tablet-card')
export class TabletCard extends LitElement {
  CUSTOM_TYPE_PREFIX = "custom:";

  constructor() {
    super();

    this.date = new Date();
    setInterval(() => {
      this.date = new Date();
    }, 1000);
  }

  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('tablet-card-editor');
  }

  public static getStubConfig(): object {
    return {};
  }

  // TODO Add any properities that should cause your element to re-render here
  // https://lit-element.polymer-project.org/guide/properties
  @property({ attribute: false }) public hass!: HomeAssistant;
  @internalProperty() private date: Date;
  @internalProperty() private config!: TabletCardConfig;

  private renderCard(card): LovelaceCard | void {
    let tag = card.type;
    if (tag.startsWith(this.CUSTOM_TYPE_PREFIX)) {
      tag = tag.substr(this.CUSTOM_TYPE_PREFIX.length);
    } else {
      tag = `hui-${tag}-card`;
    }

    const cardElement = document.createElement(tag) as LovelaceCard;
    cardElement.setConfig(card);
    cardElement.hass = hass();

    return cardElement;
  }

  // https://lit-element.polymer-project.org/guide/properties#accessors-custom
  public setConfig(config: TabletCardConfig): void {
    // TODO Check for required fields and that they are of the proper format
    if (!config) {
      throw new Error(localize('common.invalid_configuration'));
    }

    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }

    this.config = {
      name: 'Tablet',
      ...config,
    };
  }

  // https://lit-element.polymer-project.org/guide/lifecycle#shouldupdate
  protected shouldUpdate(changedProps: PropertyValues): boolean {
    return hasConfigOrEntityChanged(this, changedProps, true);
  }

  // https://lit-element.polymer-project.org/guide/templates
  protected render(): TemplateResult | void {
    const timeFormatter: Intl.DateTimeFormatOptions = {
      year: undefined,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }

    console.info("Draw")

    return html`
      <ha-card
        .actionHandler=${actionHandler({
          hasHold: hasAction(this.config.hold_action),
          hasDoubleClick: hasAction(this.config.double_tap_action),
        })}
        tabindex="0"
        .label=${`Boilerplate: ${this.config.entity || 'No Entity Defined'}`}
      >
        <div class="tablet-card-container">
          <div class="tablet-card-column tablet-card-column-1">
            <h1>${new Intl.DateTimeFormat(undefined, timeFormatter).format(this.date)}</h1>
          </div>
          <div class="tablet-card-column tablet-card-column-2">
            ${this.config.cards.map((card) =>
              html`
              <div class="tablet-card-card">
                ${ this.renderCard(card) }
              </div>
              `
            )}
          </div>
          <div class="tablet-card-column tablet-card-column-3">
            ${this.config.cards.map((card) =>
              html`
              <div class="tablet-card-card">
                ${ this.renderCard(card) }
              </div>
              `
            )}
          </div>
        </div>
      </ha-card>
    `;
  }

  protected px(int: Number): String {
    return `${int}px`;
  }

  // https://lit-element.polymer-project.org/guide/styles
  static get styles(): CSSResult {
    return css`
      :root {
        --tablet-card-spacing: 10px;
      }
      .type-custom-tablet-card {
        height: 100%;
        --tablet-card-spacing: 10px;
      }
      .tablet-card-container {
        background: #f00;
        display: flex;
        padding: var(--tablet-card-spacing) var(--tablet-card-spacing) 0;
        height: 100%;
        max-height: 93vh;
      }
      .tablet-card-column {
        flex-grow: 1;
        flex-shrink: 1;
        margin: 0 var(--tablet-card-spacing);
        overflow: hidden scroll;

        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .tablet-card-column::-webkit-scrollbar {
        display: none;
      }
      .tablet-card-column-1 {
        flex-shrink: 0;
        flex-grow: 0;
        flex-basis: 20%;
      }
      .tablet-card-card {
        margin: var(--tablet-card-spacing) 0 calc(var(--tablet-card-spacing)*2);
      }
    `;
  }
}

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
  LovelaceCardEditor,
  getLovelace,
  LovelaceCard,
} from 'custom-card-helpers'; // This is a community maintained npm module with common helper functions/types
import { hass } from "card-tools/src/hass";
import './editor';
import './screensaver-card';
import './tablet-clock-card';

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

    this.screenSaverTimeout = null;
    this.showScreenSaver = false;
  }

  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('tablet-card-editor');
  }

  public static getStubConfig(): object {
    return {};
  }

  @property({ attribute: false }) public hass!: HomeAssistant;
  @internalProperty() private showScreenSaver: boolean;
  @internalProperty() private screenSaverTimeout: any;
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

    this._wakeUp()
    this._refresh()

    console.warn("Tablet Card Config", config);
  }

  // https://lit-element.polymer-project.org/guide/lifecycle#shouldupdate
  protected shouldUpdate(changedProps: PropertyValues): boolean {
    return hasConfigOrEntityChanged(this, changedProps, false);
  }

  protected _sleep(): void {
    this.showScreenSaver = true;
    clearTimeout(this.screenSaverTimeout);

    console.log("Screensaver: Start");
  }

  protected _wakeUp(): void {
    const minutes = (this.config.screensaver_time || 1);
    this.showScreenSaver = false;

    console.log("Screensaver: Stop. Sleep in", minutes, "minutes");

    clearTimeout(this.screenSaverTimeout);
    this.screenSaverTimeout = setTimeout(() => { this._sleep() }, minutes * 60 * 1000);
  }

  protected _refresh(): void {
    if (this.config.auto_refresh_time) {
      const minutes = (this.config.auto_refresh_time);
      setTimeout(() => { window.location.reload() }, minutes * 60 * 1000);

      console.log("Auto reload page in", minutes, "minutes");
    }
  }

  // https://lit-element.polymer-project.org/guide/templates
  protected render(): TemplateResult | void {
    console.info("Tablet Card Draw")

    const logoHTML = this.config.logo ? html`
      <div class="tablet-card-card">
        <img class="tablet-card-logo" src="${this.config.logo}" />
      </div>
    ` : ``;


    return html`
      <ha-card
        .actionHandler=${actionHandler({
          hasHold: hasAction(this.config.hold_action),
          hasDoubleClick: hasAction(this.config.double_tap_action),
        })}
        tabindex="0"
        .label=${`Boilerplate: ${this.config.entity || 'No Entity Defined'}`}
        @click="${this._wakeUp}"
      >
        <screensaver-card ?visible=${this.showScreenSaver}></screensaver-card>
        <div class="tablet-card-container">
          <div class="tablet-card-column tablet-card-column-0">
            ${logoHTML}
            <tablet-clock-card></tablet-clock-card>
          </div>
          ${this.config.columns.map((column, i) =>
            html`
              <div class="tablet-card-column tablet-card-column-${i + 1}" >
                ${column.cards.map((card) =>
                  html`
                    <div class="tablet-card-card">
                      ${ this.renderCard(card) }
                    </div>
                  `
                )}
              </div>
            `
          )}
        </div>
      </ha-card>
    `;
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
        background: var(--background-color);
        display: flex;
        padding: var(--tablet-card-spacing) var(--tablet-card-spacing) 0;
        height: 100%;
        max-height: 93vh;
      }
      .tablet-card-column {
        flex-grow: 1;
        flex-shrink: 1;
        flex-basis: 30%;
        margin: 0 var(--tablet-card-spacing);
        overflow: hidden scroll;

        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .tablet-card-column::-webkit-scrollbar {
        display: none;
      }
      .tablet-card-column-0 {
        flex-shrink: 0;
        flex-grow: 0;
        flex-basis: 20%;
        padding: 0 var(--tablet-card-spacing);
      }
      .tablet-card-card {
        margin: var(--tablet-card-spacing) 0 calc(var(--tablet-card-spacing)*2);
      }
      @media only screen and (max-width: 1000px) {
        .tablet-card-container {
          flex-direction: column;
          height: auto;
          max-height: none;
        }
        .tablet-card-column {
          overflow: visible;
          flex-basis: auto;
        }
        .tablet-card-column-0 {
          flex-shrink: 1;
          flex-grow: 1;
          flex-basis: auto;
        }
      }

      .tablet-card-logo {
        width: 100%;
        max-height: 25vw;
        object-fit: contain;
      }
    `;
  }
}

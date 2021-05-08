/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  LitElement,
  customElement,
  property,
  TemplateResult,
  html,
  css,
  CSSResult,
  PropertyValues,
  internalProperty
} from 'lit-element';
import { ifDefined } from 'lit-html/directives/if-defined';
import {
  HomeAssistant,
  LovelaceCardConfig,
  createThing,
  LovelaceCard
} from 'custom-card-helpers';
import * as pjson from '../package.json';
import {
  TabletCardConfig,
  TabletCardColumn
} from './types';
import './screensaver-card';
import './tablet-clock-card';
import './tablet-notice-card'

console.info(
  `%c TABLET-CARD \n%c   Version ${pjson.version}   `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HELPERS = (window as any).loadCardHelpers ? (window as any).loadCardHelpers() : undefined;

@customElement('tablet-card')
export class TabletCard extends LitElement implements LovelaceCard {
  @property() protected _card?: LovelaceCard;
  @property() private _config?: TabletCardConfig;

  @internalProperty() private _utilityCards: LovelaceCard[];
  @internalProperty() private _columnCards: LovelaceCard[][];

  private _hass?: HomeAssistant;

  constructor() {
    super();

    this._utilityCards = [];
    this._columnCards = [];
  }

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    this._utilityCards.forEach(card => card.hass = hass);
    this._columnCards.forEach(column => column.forEach(card => card.hass = hass));
  }

  public getCardSize() {
    return 10;
  }

  public setConfig(config: TabletCardConfig): void {
    if (!config.utility_cards) {
      throw new Error(`There is no utility cards parameter defined`);
    }
    if (!config.columns) {
      throw new Error(`There is no columns cards parameter defined`);
    }
    if (config.columns.length == 0) {
      throw new Error(`There are no columns defined as cards`);
    }
    this._config = {
      ...config,
    };

    console.warn("Tablet Card Config", this._config);

    this._createUtilityStack();
    this._createColumnCardStacks();
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (this._utilityCards.length == 0) return;
    if (this._columnCards.length == 0) return;
  }

  private async _createUtilityStack() {
    this._utilityCards = await Promise.all(this._config!.utility_cards.map(async (card) =>
      this._createCard(card)
    ));
  }

  private async _createColumnCardStack(column: TabletCardColumn): Promise<LovelaceCard[]> {
    return await Promise.all(column.cards.map(async (card) =>
      this._createCard(card)
    ));
  }

  private async _createColumnCardStacks() {
    this._columnCards = await Promise.all(this._config!.columns.map(async (column) =>
      this._createColumnCardStack(column)
    ));
  }

  protected render(): TemplateResult {
    if (!this._hass || !this._config) {
      return html``;
    }

    const logoHTML = this._config!.logo ? html`
      <div class="tablet-card-card">
        <img class="tablet-card-logo" src="${this._config!.logo}" />
      </div>
    ` : ``;

    return html`
      <ha-card header=${ifDefined(this._config.title)}>
        <div class="tablet-card-container">
          <div class="tablet-card-column tablet-card-column-0">
            <div class="tablet-card-column-0-starter">
                ${logoHTML}
                <tablet-clock-card></tablet-clock-card>
              </div>
              <div class="tablet-card-column-0-ender">
                ${this._utilityCards.map((card) =>
                  html`<div class="tablet-card-card">${card}</div>`
                )}
              </div>
          </div>
          ${this._columnCards.map((column, i) => {
            return html`
              <div class="tablet-card-column tablet-card-column-${i + 1}" >
                ${column.map(card =>
                  html`
                    <div class="tablet-card-card">
                      ${card}
                    </div>
                  `
                )}
              </div>
            `;
          })}
        </div>
      </ha-card>
    `;
  }

  private async _createCard(config: LovelaceCardConfig): Promise<LovelaceCard> {
    let element: LovelaceCard;
    if (HELPERS) {
      element = (await HELPERS).createCardElement(config);
    } else {
      element = createThing(config);
    }
    if (this._hass) {
      element.hass = this._hass;
    }
    return element;
  }

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
        padding: var(--tablet-card-spacing);

        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .tablet-card-column-0-starter,
      .tablet-card-column-0-ender {
        flex-grow: 0;
        flex-shrink: 0;
      }
      .tablet-card-column-0-starter {
        margin-bottom: calc(var(--tablet-card-spacing)*2);
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
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    LitElement,
    html,
    customElement,
    CSSResult,
    TemplateResult,
    css,
    PropertyValues,
    internalProperty,
  } from 'lit-element';
  import {
    hasConfigOrEntityChanged, LovelaceCard,
  } from 'custom-card-helpers';
import { TabletClockCardConfig } from './types';
import { localize } from './localize/localize';

  @customElement('tablet-clock-card')
  export class TabletClockCard extends LitElement implements LovelaceCard {
    constructor() {
      super();

      this.date = new Date();
      setInterval(() => {
        this.date = new Date();
      }, 250);

      this.config = this.config || {};
      this.config.frameless = false;
    }

    @internalProperty() private date: Date;
    @internalProperty() private config!: TabletClockCardConfig;

    public static getStubConfig(): object {
      return {};
    }

    public getCardSize(): number {
      return 10;
    }

    public setConfig(config: TabletClockCardConfig): void {
      if (!config) {
        throw new Error(localize('common.invalid_configuration'));
      }

      this.config = {
        name: 'Tablet',
        frameless: false,
        ...config,
      };
    }

    protected shouldUpdate(changedProps: PropertyValues): boolean {
      return hasConfigOrEntityChanged(this, changedProps, true);
    }

    protected render(): TemplateResult | void {
      const timeFormatter: Intl.DateTimeFormatOptions = {
        year: undefined,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }

      const clockHTML = html`
        ${this.config.frameless ? `` : html`<ha-card tabindex="0">`}
          <div class="tablet-card-clock">
            <span>
              ${new Intl.DateTimeFormat(undefined, timeFormatter).format(this.date)}
            </span>
          </div>
        ${this.config.frameless ? `` : html`</ha-card>`}
      `;

      return clockHTML;
    }

    static get styles(): CSSResult {
      return css`
        .tablet-card-clock {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tablet-card-clock span {
          font-size: 4rem;
          line-height: 100%;
        }
      `;
    }
  }


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
    hasConfigOrEntityChanged,
  } from 'custom-card-helpers';

  @customElement('tablet-clock-card')
  export class TabletClockCard extends LitElement {
    constructor() {
      super();

      this.date = new Date();
      setInterval(() => {
        this.date = new Date();
      }, 250);
    }

    @internalProperty() private date: Date;

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
        <div class="tablet-card-clock">
          <span>
            ${new Intl.DateTimeFormat(undefined, timeFormatter).format(this.date)}
          </span>
        </div>
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


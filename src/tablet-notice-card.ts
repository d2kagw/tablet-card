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
    property,
  } from 'lit-element';
  import {
    hasConfigOrEntityChanged, HomeAssistant,
  } from 'custom-card-helpers';
import { TabletNoticeCardConfig } from './types';
import { localize } from './localize/localize';

  @customElement('tablet-notice-card')
  export class TabletNoticeCard extends LitElement {
    constructor() {
      super();
    }

    @property({ attribute: false }) public hass!: HomeAssistant;
    @internalProperty() private config!: TabletNoticeCardConfig;

    public setConfig(config: TabletNoticeCardConfig): void {
      this.config = {
        name: 'Tablet',
        ...config,
      };
    }

    protected shouldUpdate(changedProps: PropertyValues): boolean {
      if (
        this.hass.states &&
        changedProps.has("hass") &&
        this.config.entity &&
        this.hass.states[this.config.entity] &&
        (changedProps.get("hass") as HomeAssistant).states[this.config.entity]
      ) {
        if (
          (changedProps.get("hass") as HomeAssistant) &&
          (changedProps.get("hass") as HomeAssistant).states[this.config.entity].state !==
          this.hass.states[this.config.entity].state
        ) {
          return true;
        }
      }

      return hasConfigOrEntityChanged(this, changedProps, false);
    }

    protected render(): TemplateResult | void {
      const notice = html`
        <ha-card
          tabindex="0"
          style="background-color: ${this.config.color||'none'};"
        >
          <div class="tablet-notice-card">
            <span class="tablet-notice-card-icon">
              ${this.config.icon ? html`<ha-icon icon="${this.config.icon}"></ha-icon>` : ``}
            </span>
            <span class="tablet-notice-card-label">
              ${this.config.label}
            </span>
          </div>
        </ha-card>
      `;

      // only render if the entity state matches
      if (this.hass.states && this.config.entity && this.hass.states[this.config.entity]) {
        if (this.hass.states[this.config.entity].state === (this.config.state||'on')) {
          return notice;
        }
      } else {
        if (this.hass.states && this.config.entity) {
          if (this.hass.states[this.config.entity]) {
            throw new Error(localize('common.entity_not_found'));
          }
        }
      }
    }

    static get styles(): CSSResult {
      return css`
        :root {
          --tablet-card-spacing: 10px;
        }

        .tablet-notice-card {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          height: calc(1rem + (var(--tablet-card-spacing) * 4));
        }

        .tablet-notice-card-icon {
          font-size: 1rem;
          line-height: 100%;
          padding: calc(var(--tablet-card-spacing) * 2);
          padding-right: 0;
        }

        .tablet-notice-card-icon ha-icon {
          padding-right: calc(var(--tablet-card-spacing) * 2);
        }

        .tablet-notice-card-label {
          font-size: 1rem;
          line-height: 100%;
          padding: calc(var(--tablet-card-spacing) * 2);
          padding-left: 0;
        }
      `;
    }
  }


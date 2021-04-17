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
} from 'lit-element';
import {
  hasConfigOrEntityChanged,
} from 'custom-card-helpers';

@customElement('screensaver-card')
export class ScreenSaverCard extends LitElement {
  constructor() {
    super();
    this.visible = false;
  }

  @property({ type: Boolean }) public visible: boolean;

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    return hasConfigOrEntityChanged(this, changedProps, true);
  }

  protected render(): TemplateResult | void {
    if (this.visible) {
      return html`
        <div class="screensaver-card">
          <h1>what up</h1>
        </div>
      `;
    } else {
      return html``;
    }
  }

  static get styles(): CSSResult {
    return css`
      .screensaver-card {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        background-color: #00f;
        z-index: 100000;
      }
    `;
  }
}


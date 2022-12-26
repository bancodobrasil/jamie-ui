declare module 'react-imask' {
  import IMask from 'imask';

  /**
   * Missing some types here, It would be great if someone
   * stepped in.
   */
  type masked<T> = T extends DateConstructor
    ? IMask.MaskedDate
    : T extends NumberConstructor
    ? IMask.MaskedNumber
    : T extends RegExpConstructor
    ? IMask.MaskedRegExp
    : // eslint-disable-next-line @typescript-eslint/ban-types
    T extends Function
    ? IMask.MaskedFunction
    : IMask.Masked<IMaskInputProps['mask']>;

  interface InputMask<T extends IMask.AnyMaskedOptions> {
    el: IMask.MaskElement;
    masked: masked<T>;
    mask: T['mask'];
    value: string;
    unmaskedValue: string;
    typedValue: IMask.MaskedTypedValue<T['mask']>;
    cursorPos: number;
    readonly selectionStart: number;

    alignCursor(): void;
    alignCursorFriendly(): void;
  }

  type BlockOptions =
    | IMask.MaskedDateOptions
    | IMask.MaskedNumberOptions
    | IMask.MaskedPatternOptions
    | IMask.MaskedPatternOptions
    | IMask.MaskedNumberOptions
    | IMask.MaskedDateOptions
    | IMask.MaskedEnumOptions
    | IMask.MaskedRangeOptions;

  export interface IMaskInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    mask: IMask.AnyMaskedOptions['mask'];
    value?: typeof IMask.InputMask['prototype']['value'] | undefined;
    unmask?: 'typed' | boolean;
    radix?: IMask.MaskedNumber['radix'];
    overwrite?: typeof IMask.Masked['prototype']['overwrite'];
    placeholderChar?: typeof IMask.MaskedPattern['prototype']['placeholderChar'];
    lazy?: typeof IMask.MaskedPattern['prototype']['lazy'];
    definitions?: typeof IMask.MaskedPattern['prototype']['definitions'];
    blocks?: { [key: string]: BlockOptions | IMask.AnyMaskedOptions };
    pattern?: string;
    autofix?: boolean;
    thousandsSeparator?: string;
    mapToRadix?: string[];
    scale?: number;
    signed?: boolean;
    normalizeZeros?: boolean;
    min?: number;
    max?: number;
    onAccept?: <T>(
      value: IMaskInputProps['value'],
      maskRef: IMask.InputMask<IMask.AnyMaskedOptions>,
      ...args: T[]
    ) => void;
    onComplete?: <T>(
      value: IMaskInputProps['value'],
      maskRef: IMask.InputMask<IMask.AnyMaskedOptions>,
      ...args: T[]
    ) => void;
    inputRef?: (el: HTMLInputElement) => void;
    prepare?: typeof IMask.Masked['prototype']['prepare'];
    validate?: typeof IMask.Masked['prototype']['validate'];
    commit?: typeof IMask.Masked['prototype']['commit'];
    format?: (value: Date) => string;
    parse?: (value: string) => Date;
    dispatch?: typeof IMask.MaskedDynamic['prototype']['dispatch'];
  }

  export function IMaskMixin<T, D>(
    Component: React.ComponentType<{ inputRef: React.Ref<D> } & T>,
  ): React.ComponentType<T & IMaskInputProps>;

  // eslint-disable-next-line react/prefer-stateless-function
  export class IMaskInput extends React.Component<IMaskInputProps> {}
}

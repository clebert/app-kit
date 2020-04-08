import * as preact from 'preact';
import * as hooks from 'preact/hooks';
import {useSearchParam} from '../hooks/use-search-param';
import {Button} from './bulma/button';
import {Delete} from './bulma/delete';
import {Field} from './bulma/field';
import {Input} from './bulma/input';

export interface SearchFieldProps {
  readonly isDisabled?: boolean;
}

export function SearchField({
  isDisabled,
}: SearchFieldProps): preact.JSX.Element {
  const searchInputRef = hooks.useRef<HTMLInputElement>(null);

  hooks.useEffect(() => {
    if (searchInputRef.current && !isDisabled) {
      searchInputRef.current.focus();
    }
  }, [isDisabled]);

  const [searchParam = '', setSearchParam] = useSearchParam('search');

  const handleSearchInputInput = hooks.useCallback(
    (event: preact.JSX.TargetedEvent<HTMLInputElement, Event>) =>
      setSearchParam(event.currentTarget.value || undefined),
    []
  );

  const handleSearchInputKeyUp = hooks.useCallback(
    (event: preact.JSX.TargetedEvent<HTMLInputElement, KeyboardEvent>) => {
      if (event.key === 'Escape') {
        setSearchParam(undefined);
      } else if (event.key === 'Enter' && searchInputRef.current) {
        searchInputRef.current.blur();
      }
    },
    []
  );

  const handleDeleteButtonClick = hooks.useCallback(
    () => setSearchParam(undefined),
    []
  );

  return (
    <Field hasAddons isDisabled={isDisabled}>
      <Input
        ref={searchInputRef}
        placeholder="Enter search term here"
        value={searchParam}
        onInput={handleSearchInputInput}
        onKeyUp={handleSearchInputKeyUp}
      />

      <Button onClick={handleDeleteButtonClick}>
        <Delete />
      </Button>
    </Field>
  );
}

import * as preact from 'preact';
import * as hooks from 'preact/hooks';
import {useSearchParam} from '../hooks/use-search-param';
import {Container} from './bulma/container';
import {Hero} from './bulma/hero';
import {Title} from './bulma/title';

export interface ErrorUiProps {
  readonly children: preact.ComponentChildren;
}

export function ErrorUi({children}: ErrorUiProps): preact.JSX.Element {
  const [errorParam, setErrorParam] = useSearchParam('error');
  const errorMessage = errorParam ?? 'An unknown error occured.';

  hooks.useEffect(() => {
    if (errorParam !== undefined) {
      setErrorParam(undefined);
    }
  }, [errorParam]);

  return hooks.useMemo(
    () =>
      errorParam === undefined ? (
        <preact.Fragment>{children}</preact.Fragment>
      ) : (
        <Hero color="danger" size="fullHeight" isBold>
          <Container>
            <Title size="1">Oops!</Title>

            <Title size="3" isSubtitle>
              {errorMessage}
            </Title>
          </Container>
        </Hero>
      ),
    []
  );
}

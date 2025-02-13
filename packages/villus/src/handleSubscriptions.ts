import { normalizeQuery } from '../../shared/src/utils';
import { ClientPlugin, ClientPluginOperation, ObservableLike, StandardOperationResult } from './types';

export type SubscriptionForwarder<TData = any> = (
  operation: ClientPluginOperation & { query: string }
) => ObservableLike<StandardOperationResult<TData>>;

export function handleSubscriptions(forwarder: SubscriptionForwarder): ClientPlugin {
  const forward = forwarder;

  return function subscriptionsHandlerPlugin({ operation, useResult }) {
    if (operation.type !== 'subscription') {
      return;
    }

    if (!forward) {
      throw new Error('No subscription forwarder was set.');
    }

    const normalizedQuery = normalizeQuery(operation.query);
    if (!normalizedQuery) {
      throw new Error('A query must be provided.');
    }

    useResult(forward({ ...operation, query: normalizedQuery }) as any, true);
  };
}

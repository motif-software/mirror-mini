export interface MappingRegistration<T, CanonicalFormat> {
  toCanonical: (store: any, action: T) => CanonicalFormat | CanonicalFormat[] | null;
  fromCanonical: (store: any, action: CanonicalFormat) => T | T[] | null;
}

export type MappingRegistry<CanonicalFormat> = ComponentRegistration<CanonicalFormat>[];

export type ComponentRegistration<CanonicalFormat> = {
  [key: string]: MappingRegistration<any, CanonicalFormat>;
};

export function createActionSync<CanonicalFormat>(
  registry: MappingRegistry<CanonicalFormat>,
  canonicalActionTypes: string[]
) {
  return (store) => (next) => (action) => {
    const isCanonical = canonicalActionTypes.includes(action.type);
    let result = next(action);

    registry.forEach((r) => {
      Object.entries(r).forEach(([k, v]) => {
        let syncActions: any;
        if (isCanonical) {
          syncActions = v.fromCanonical(store, action);
        } else {
          if (action.type === k) {
            syncActions = v.toCanonical(store, action);
          }
        }
        if (syncActions == null) {
          return;
        }
        const newActions = Array.isArray(syncActions) ? syncActions : [syncActions];
        newActions.forEach((a) => {
          result = next(a);
        });
      });
    });
    return result;
  };
}

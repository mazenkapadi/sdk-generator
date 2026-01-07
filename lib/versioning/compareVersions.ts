export interface VersionChange {
  type: 'added' | 'removed' | 'modified';
  category: 'endpoint' | 'schema' | 'parameter' | 'response';
  path?: string;
  method?: string;
  description: string;
}

export interface VersionComparison {
  changes: VersionChange[];
  summary: {
    added: number;
    removed: number;
    modified: number;
  };
}

export function compareVersions(oldSpec: any, newSpec: any): VersionComparison {
  const changes: VersionChange[] = [];

  // Compare paths/endpoints
  const oldPaths = Object.keys(oldSpec.paths || {});
  const newPaths = Object.keys(newSpec.paths || {});

  // Added paths
  newPaths.forEach(path => {
    if (!oldPaths.includes(path)) {
      Object.keys(newSpec.paths[path]).forEach(method => {
        if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
          changes.push({
            type: 'added',
            category: 'endpoint',
            path,
            method: method.toUpperCase(),
            description: `Added ${method.toUpperCase()} ${path}`,
          });
        }
      });
    }
  });

  // Removed paths
  oldPaths.forEach(path => {
    if (!newPaths.includes(path)) {
      Object.keys(oldSpec.paths[path]).forEach(method => {
        if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
          changes.push({
            type: 'removed',
            category: 'endpoint',
            path,
            method: method.toUpperCase(),
            description: `Removed ${method.toUpperCase()} ${path}`,
          });
        }
      });
    }
  });

  // Modified endpoints
  oldPaths.forEach(path => {
    if (!newPaths.includes(path)) return;

    const oldPathObj = oldSpec.paths[path];
    const newPathObj = newSpec.paths[path];

    ['get', 'post', 'put', 'patch', 'delete'].forEach(method => {
      const oldMethod = oldPathObj[method];
      const newMethod = newPathObj[method];

      if (!oldMethod && newMethod) {
        changes.push({
          type: 'added',
          category: 'endpoint',
          path,
          method: method.toUpperCase(),
          description: `Added ${method.toUpperCase()} ${path}`,
        });
      } else if (oldMethod && !newMethod) {
        changes.push({
          type: 'removed',
          category: 'endpoint',
          path,
          method: method.toUpperCase(),
          description: `Removed ${method.toUpperCase()} ${path}`,
        });
      } else if (oldMethod && newMethod) {
        // Check for changes in parameters
        const oldParams = oldMethod.parameters || [];
        const newParams = newMethod.parameters || [];
        
        if (JSON.stringify(oldParams) !== JSON.stringify(newParams)) {
          changes.push({
            type: 'modified',
            category: 'parameter',
            path,
            method: method.toUpperCase(),
            description: `Modified parameters for ${method.toUpperCase()} ${path}`,
          });
        }

        // Check for changes in responses
        if (JSON.stringify(oldMethod.responses) !== JSON.stringify(newMethod.responses)) {
          changes.push({
            type: 'modified',
            category: 'response',
            path,
            method: method.toUpperCase(),
            description: `Modified responses for ${method.toUpperCase()} ${path}`,
          });
        }

        // Check for changes in request body
        if (JSON.stringify(oldMethod.requestBody) !== JSON.stringify(newMethod.requestBody)) {
          changes.push({
            type: 'modified',
            category: 'endpoint',
            path,
            method: method.toUpperCase(),
            description: `Modified request body for ${method.toUpperCase()} ${path}`,
          });
        }
      }
    });
  });

  // Compare schemas
  const oldSchemas = Object.keys(oldSpec.components?.schemas || {});
  const newSchemas = Object.keys(newSpec.components?.schemas || {});

  newSchemas.forEach(schema => {
    if (!oldSchemas.includes(schema)) {
      changes.push({
        type: 'added',
        category: 'schema',
        description: `Added schema: ${schema}`,
      });
    }
  });

  oldSchemas.forEach(schema => {
    if (!newSchemas.includes(schema)) {
      changes.push({
        type: 'removed',
        category: 'schema',
        description: `Removed schema: ${schema}`,
      });
    } else {
      const oldSchema = oldSpec.components.schemas[schema];
      const newSchema = newSpec.components.schemas[schema];
      if (JSON.stringify(oldSchema) !== JSON.stringify(newSchema)) {
        changes.push({
          type: 'modified',
          category: 'schema',
          description: `Modified schema: ${schema}`,
        });
      }
    }
  });

  const summary = {
    added: changes.filter(c => c.type === 'added').length,
    removed: changes.filter(c => c.type === 'removed').length,
    modified: changes.filter(c => c.type === 'modified').length,
  };

  return { changes, summary };
}

export function generateChangelog(changes: VersionChange[]): string {
  const grouped = {
    added: changes.filter(c => c.type === 'added'),
    modified: changes.filter(c => c.type === 'modified'),
    removed: changes.filter(c => c.type === 'removed'),
  };

  let changelog = '';

  if (grouped.added.length > 0) {
    changelog += '### Added\n';
    grouped.added.forEach(change => {
      changelog += `- ${change.description}\n`;
    });
    changelog += '\n';
  }

  if (grouped.modified.length > 0) {
    changelog += '### Modified\n';
    grouped.modified.forEach(change => {
      changelog += `- ${change.description}\n`;
    });
    changelog += '\n';
  }

  if (grouped.removed.length > 0) {
    changelog += '### Removed\n';
    grouped.removed.forEach(change => {
      changelog += `- ${change.description}\n`;
    });
  }

  return changelog.trim();
}

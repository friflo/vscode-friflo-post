// Copyright (c) Ullrich Praetz. All rights reserved.
// See LICENSE file in the project root for full license information.

import * as minimatch  from "minimatch";


// Separate minimatch because of nasty import 
export function Match (target: string, pattern: string) {
    return minimatch(target, pattern, { matchBase: true });
}

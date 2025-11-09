/**
 * Main.js - Legacy compatibility wrapper
 * This file maintains backward compatibility while transitioning to modules
 * 
 * For new code, use the modular architecture in assets/js/modules/
 * This file will be deprecated once full migration is complete
 */

// Import modular version
import './main-modular.js';

// Legacy global functions are now provided by page-init.js module
// This file exists for backward compatibility during migration
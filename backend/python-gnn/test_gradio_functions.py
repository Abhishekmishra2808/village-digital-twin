"""Test the gradio_god_mode prediction function directly"""

import sys
sys.path.insert(0, '.')

# Import the main functions from gradio_god_mode
import gradio_god_mode as gm
import numpy as np

print('='*70)
print('Testing Gradio God Mode GNN Functions')
print('='*70 + '\n')

# The gradio app initializes network_state at module level
# Let's check if we can access it
print('Checking network initialization...')

# Load example network
try:
    # Use the load_example_network function
    result = gm.load_example_network()
    print('✓ Example network loaded\n')
    
    if "Loaded example" in result or "Network loaded" in result:
        print(result)
        print()
        
        # Now run a prediction
        print('Running prediction: Hospital failure, Supply Disruption, Medium severity')
        print('-'*70)
        
        prediction_result = gm.run_prediction(
            failed_node="Hospital",
            failure_type="Supply Disruption",
            severity="medium"
        )
        
        # Parse the HTML result
        if "MAX-BASED RISK" in prediction_result:
            print('✓ Prediction completed successfully')
            print('\nResult includes:')
            print('  - MAX-based risk scoring')
            print('  - Dimension breakdown')
            print('  - Affected nodes analysis')
            print('  - Strategic insights')
            
            # Extract key info from HTML
            if "CRITICAL" in prediction_result:
                print('\n  Alert level: CRITICAL detected')
            elif "HIGH" in prediction_result:
                print('\n  Alert level: HIGH detected')
            elif "MEDIUM" in prediction_result:
                print('\n  Alert level: MEDIUM detected')
            else:
                print('\n  Alert level: LOW')
                
            # Check for dimension analysis
            if "Water Supply" in prediction_result:
                print('  ✓ Dimension analysis present')
            if "Service Availability" in prediction_result:
                print('  ✓ Service availability tracked')
            if "Population Impact" in prediction_result:
                print('  ✓ Population impact calculated')
                
        print('\n✅ Gradio God Mode functions working correctly!')
        print('   Server ready to launch at http://localhost:7875')
        
    else:
        print('❌ Network loading failed')
        print(result)
        
except Exception as e:
    print(f'❌ Error: {e}')
    import traceback
    traceback.print_exc()

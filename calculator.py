def add(x, y):
    return x + y

def subtract(x, y):
    return x - y

def multiply(x, y):
    return x * y

def divide(x, y):
    if y == 0:
        return "Error: Cannot divide by zero"
    return x / y

def power(x, y):
    return x ** y

# Color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

# Global variable to store calculation history
calculation_history = []

def display_menu():
    print(f"\n{Colors.HEADER}{'='*50}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.UNDERLINE}      PYTHON CALCULATOR{Colors.ENDC}")
    print(f"{Colors.HEADER}{'='*50}{Colors.ENDC}")
    print(f"{Colors.BLUE}1. Add (+){Colors.ENDC}")
    print(f"{Colors.CYAN}2. Subtract (-){Colors.ENDC}")
    print(f"{Colors.GREEN}3. Multiply (*){Colors.ENDC}")
    print(f"{Colors.WARNING}4. Divide (/){Colors.ENDC}")
    print(f"{Colors.FAIL}5. Power (^){Colors.ENDC}")
    print(f"{Colors.HEADER}6. View History{Colors.ENDC}")
    print(f"{Colors.HEADER}7. Clear History{Colors.ENDC}")
    print(f"{Colors.HEADER}8. Exit{Colors.ENDC}")
    print(f"{Colors.HEADER}{'='*50}{Colors.ENDC}")

def get_number(prompt):
    while True:
        try:
            return float(input(f"{Colors.CYAN}{prompt}{Colors.ENDC}"))
        except ValueError:
            print(f"{Colors.FAIL}Invalid input. Please enter a valid number.{Colors.ENDC}")

def add_to_history(operation, x, y, result):
    """Add a calculation to the history"""
    calculation = f"{x} {operation} {y} = {result}"
    calculation_history.append(calculation)
    return calculation

def view_history():
    """Display calculation history"""
    if not calculation_history:
        print(f"\n{Colors.WARNING}No history available.{Colors.ENDC}")
        return
    
    print(f"\n{Colors.HEADER}=== Calculation History ==={Colors.ENDC}")
    for i, calc in enumerate(calculation_history, 1):
        print(f"{Colors.GREEN}{i}. {calc}{Colors.ENDC}")
    print(f"{Colors.HEADER}========================={Colors.ENDC}")

def clear_history():
    """Clear calculation history"""
    global calculation_history
    calculation_history = []
    print(f"\n{Colors.GREEN}History cleared successfully!{Colors.ENDC}")

def calculator():
    while True:
        display_menu()
        
        try:
            choice = input("\nEnter your choice (1-8): ")
            
            if choice == '8':
                print("\nThank you for using the Python Calculator. Goodbye!")
                break
                
            if choice == '6':
                view_history()
                input("\nPress Enter to continue...")
                continue
                
            if choice == '7':
                clear_history()
                input("\nPress Enter to continue...")
                continue
                
            if choice not in ['1', '2', '3', '4', '5']:
                print(f"\n{Colors.FAIL}Invalid choice. Please select a number between 1 and 8.{Colors.ENDC}")
                continue
                
            print("\nEnter two numbers:")
            num1 = get_number("First number: ")
            num2 = get_number("Second number: ")
            
            operations = {
                '1': ("+", add),
                '2': ("-", subtract),
                '3': ("*", multiply),
                '4': ("/", divide),
                '5': ("^", power)
            }
            
            symbol, operation = operations[choice]
            result = operation(num1, num2)
            
            # Add to history and display result
            calculation = add_to_history(symbol, num1, num2, result)
            print(f"\n{Colors.GREEN}Result: {calculation}{Colors.ENDC}")
            
        except KeyboardInterrupt:
            print("\n\nOperation cancelled by user.")
            break
        except Exception as e:
            print(f"\nAn error occurred: {e}")
        
        input("\nPress Enter to continue...")

if __name__ == "__main__":
    calculator()

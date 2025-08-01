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

# Global variable to store calculation history
calculation_history = []

def display_menu():
    print("\n" + "="*40)
    print("      PYTHON CALCULATOR")
    print("="*40)
    print("1. Add (+)")
    print("2. Subtract (-)")
    print("3. Multiply (*)")
    print("4. Divide (/)")
    print("5. Power (^)")
    print("6. View History")
    print("7. Clear History")
    print("8. Exit")
    print("="*40)

def get_number(prompt):
    while True:
        try:
            return float(input(prompt))
        except ValueError:
            print("Invalid input. Please enter a valid number.")

def add_to_history(operation, x, y, result):
    """Add a calculation to the history"""
    calculation = f"{x} {operation} {y} = {result}"
    calculation_history.append(calculation)
    return calculation

def view_history():
    """Display calculation history"""
    if not calculation_history:
        print("\nNo history available.")
        return
    
    print("\n=== Calculation History ===")
    for i, calc in enumerate(calculation_history, 1):
        print(f"{i}. {calc}")
    print("=========================")

def clear_history():
    """Clear calculation history"""
    global calculation_history
    calculation_history = []
    print("\nHistory cleared successfully!")

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
                print("\nInvalid choice. Please select a number between 1 and 6.")
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
            
            print(f"\nResult: {num1} {symbol} {num2} = {result}")
            
        except KeyboardInterrupt:
            print("\n\nOperation cancelled by user.")
            break
        except Exception as e:
            print(f"\nAn error occurred: {e}")
        
        input("\nPress Enter to continue...")

if __name__ == "__main__":
    calculator()

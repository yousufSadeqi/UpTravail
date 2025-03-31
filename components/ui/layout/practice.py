def merge(left , right):

    sorted_list = [] 
    i = j = 0 
    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            sorted_list.append(left[i])
            i+=1 
        else:
            sorted_list.append(right[j])
            j+=1
    print(i - len(left) ,j - len(right))
    print(sorted_list)
    while i < len(left):
        sorted_list.append(left[i])
        i+=1
    while j < len(right):
        sorted_list.append(right[j])
        j+=1
    return sorted_list


def merge_algo(arr):
    if len(arr) == 1:
        return arr
    mid = len(arr) // 2
    left_half = [arr[i] for i in range(mid)]
    right_half = [arr[j] for j in range(mid, len(arr))]
    return merge(merge_algo(left_half), merge_algo(right_half))



class Node:
    def __init__(self, left, racine, right):
        self.left = left
        self.right = right
        self.racine = racine
    def get_left(self):
        return self.left
    def get_right(self):
        return self.right
    def get_racine(self):
        return self.racine

# def construire(mini, maxi):
#     assert isinstance(mini, int) and .... and .....
#     if (mini - maxi) == 0 or (mini - maxi) == 1:
#         return Node(None, mini, None)
#     elif (mini - maxi) == 2:
#         return Node(None, maxi, None)
#     else:
#         sag = construire(mini,(mini+maxi)//2) #left
#         sad = construire(((mini+maxi)//2)+1, maxi) #right
#         return Node(sag , (mini+maxi)//2, sad)


def maximum(abre):
    if abre is None:
        return None
    elif abre.get_right() == None:
        return abre
    else:
        maximum(abre.get_right())




def merge(arr1, arr2):
    left = 0
    right = 0
    result = [] 
    while left < len(arr1) and right < len(arr2):
        if arr1[left] < arr2[right]:
            result.append(arr1[left])
            left += 1
        else:
            result.append(arr2[right])
            right += 1 
    if right < len(arr2):
        for i in range(right, len(arr2)):
            result.append(arr2[i])
    elif left < len(arr1):
        for i in range(left, len(arr1)):
            result.append(arr1[i])
    return result

def merge_rec(arr):
    mid = len(arr)//2
    if len(arr) == 1:
        return arr
    else:
        sag = merge_rec(arr[:mid])
        sad = merge_rec(arr[mid:])
        return merge(sag , sad)
    
print(merge_rec([1,2,3,32,54,3]))
    

def merge_rec1(arr):
    if len(arr) == 1:
        return arr
    else:
        mid = len(arr)//2
        left_arr = [arr[i] for i in range(mid)]
        right_arr = [arr[j] for j in range(mid, len(arr))]
        return merge(merge_rec1(left_arr) , merge_rec1(right_arr))
print(merge_rec1([1,10,29,10203,12,90]))

def power(num1 , num2):
    if num2 == 1:
        return num1
    else:
        return num1 * power(num1, num2 -1)
print(power(2, 10))

def fab(number):
    if number == 1 or number == 0:
        return number
    else:
        return fab(number - 1) + fab(number - 2)


print(fab(7))
    

def count_char(cara, letter):
    if len(cara) == 1 and cara == letter:
        return 1
    elif len(cara) == 1 and cara != letter:
        return 0
    else:
        if cara[0] == letter:
            count = 1
        else:
            count = 0
        new_cara = ''
        for i in range(1, len(cara)):
            new_cara += cara[i] 
        return count + count_char(new_cara, letter)
print(count_char('a', 'a'))

def binary_search(lst, num):
    if num == lst[0] :
        return 0
    elif len(lst) == 1 and num != lst[0]:
        return False
    else:
        new_list = [lst[i] for i in range(1, len(lst))]
        return 1 + binary_search(new_list, num)
    
print (binary_search([1,2,4,5,7,9], 0))

class_1 = {
    'Alice': 19,
    'Bob' :20,
    'Ice' : 20,
    'Pop' : 18,
    'kamm' :20
}
def palmares(notes):
    maxi = 0
    lst = [] 
    for value in notes.values():
        if maxi < value:
            maxi = value
    for key, value in notes.items():
        if value == maxi:
            lst.append(key)
    return (maxi, lst)



print(palmares(class_1))

def empa(liste_masses, c):
    n = len(liste_masses)
    index_boite = 0
    boites = [0]*n 
    for masse in liste_masses:
        i = 0 
        while i <= index_boite and boites[i] + masse > c:
            i += 1
        if i == index_boite + 1:
            index_boite += 1 
        boites[i] += masse
        
    return boites

print(empa([4, 8, 1, 4, 2, 1] , 10))


def rec(num):
    if len(str(num)) == 1:
        return int(num)
    else:
        num_o = str(num) 
        count = num_o[0]
        new_num = ''
        for i in range(1, len(str(num))):
            new_num += num_o[i]
        return int(count) + rec(int(new_num))
    
print(rec(1234))

def functiond(arr, cap):
    remove_index = set() 
    result = [] 
    for i in range(len(arr)):
        for j in range(i, len(arr)):
            if j not in remove_index and arr[i] + arr[j] > cap:
                result += [arr[i] , arr[j]]
                remove_index.add(i)
                remove_index.add(j)
    print(remove_index)
    return result

print(functiond([4,8,1,4,2,1], 10))


def empa(liste_masses, c):
    n = len(liste_masses)
    index_boite = 0
    boites = [0]*n 
    for masse in liste_masses:
        i = 0 
        while i <= index_boite and boites[i] + masse > c:
            i += 1
        if i == index_boite + 1:
            index_boite += 1 
        boites[i] += masse
        
    return boites

print(empa([4, 8, 1, 4, 2, 1] , 10))


def rec1(num):
    if num < 10:
        return num
    else:
        def rec2(num):
            if len(str(num)) == 1:
                return int(num)
            else:
                new_num = '' 
                num_s = str(num)
                count = num_s[0]
                for i in range(1, len(num_s)):
                    new_num += num_s[i]
                return int(count) + rec1(int(new_num))
        return rec1(rec2(num))

print(rec1(192932))
        
# def rec1(num):
#     if num < 10:  # Base case: if the number is a single digit, return it
#         return num
#     else:
#         def rec2(num):
#             num_s = str(num)  # Convert the number to a string
#             if len(num_s) == 1:  # If it's a single digit, return it
#                 return int(num_s)
#             else:
#                 # Sum the first digit and the rest of the number
#                 first_digit = int(num_s[0])
#                 rest_of_number = int(num_s[1:])
#                 return first_digit + rec2(rest_of_number)  # Recursively sum the digits
#         return rec1(rec2(num))  # Recursively call rec1 with the result of rec2

# print(rec1(192932))  # Output: 3


def tri_section(arr):
    for i in range(len(arr)):
        maxi = i
        for j in range(i , len(arr)):
            if arr[j] < arr[maxi]:
                maxi = j
        arr[i] , arr[maxi] = arr[maxi], arr[i]
    return arr

print(tri_section([12,5,61012,12,32,3,3]))


def tri_insertion(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1 
        while j >= 0 and key < arr[j]:
            arr[j+1] = arr[j]
            j -= 1
        arr[j+1] = key
    return arr

print(tri_insertion([1,10,11,12,3,2,4]))


def merge(arr1, arr2):
    left = 0
    right = 0
    result = [] 
    while left < len(arr1) and right < len(arr2):
        if arr1[left] < arr2[right]:
            result.append(arr1[left])
            left += 1
        else:
            result.append(arr2[right])
            right +=1 
    for i in range(right, len(arr2)):
        result.append(arr2[i])
    for j in range(left, len (arr1)):
        result.append(arr1[j])
    return result

def merge_rec(arr):
    mid = len(arr) //2
    if len(arr) == 1:
        return arr
    else:
        # sag = merge_rec(arr[:mid])
        # sad = merge_rec(arr[mid:])
        sad = merge_rec([arr[i] for i in range(mid)])
        sag = merge_rec([arr[j] for j in range(mid , len(arr))])
        return merge(sag, sad)

print(merge_rec([1,3,6,9,10,20,21,2,3,5,6,7,10]))


[1,5,]
def recherche_di(arr):

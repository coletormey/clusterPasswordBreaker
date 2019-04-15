#include <node.h>
#include <iostream>
#include <string>
#include <math.h>
#include "./PicoSHA2/picosha2.h"

using v8::FunctionCallbackInfo;
using v8::Isolate;
using v8::Local;
using v8::Object;
using v8::String;
using v8::Value;
using v8::Null;
using v8::Number;
using v8::Boolean;
using namespace std;

#define NUM_ITEMS 26
#define ITEM_LENGTH 4
#define ATTACK_SPACE NUM_ITEMS * NUM_ITEMS * NUM_ITEMS * NUM_ITEMS

// most important function, how to map a number to a potential password
string map_index_to_potential_password(int index) {
  int temp_index = index;
  char potential_password[ITEM_LENGTH + 1];
  for (int i = 0; i < ITEM_LENGTH; i++){
    int current_div = pow(NUM_ITEMS, ITEM_LENGTH - i- 1);
    potential_password[i] = floor(temp_index / current_div) + 97; // because a is 97
    temp_index = temp_index % current_div;
  }
  potential_password[ITEM_LENGTH] = 0; // null terminator
  // comment out the logging for actual testing, this is slow
  cout << "testing : " << string(potential_password) << "\n";
  return string(potential_password);
}

// checks if a hash matches the target hash
bool check_hash_against_target(string potential_password, string target) {
  vector<unsigned char> hash(picosha2::k_digest_size);
  picosha2::hash256(potential_password.begin(), potential_password.end(), hash.begin(), hash.end());
  string hashed_string = picosha2::bytes_to_hex_string(hash.begin(), hash.end());
  return hashed_string == target;
}

// this function tries all combinations from start to stop
string attack (string target, int start, int stop) {
  for (int i = start; i < stop; i++){
    string potential_password = map_index_to_potential_password(i);
    if (check_hash_against_target(potential_password, target)) {
      return potential_password;
    }
  }
  return ""; // empty string if not found
}

// do actual work here
void crack_password(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();
  Local<Object> result = Object::New(isolate);

  // get hash
  String::Utf8Value inputHash(args[0]->ToString());
  string hash = string(*inputHash);


  int i = args[1]->NumberValue();
  int totalClients = args[2]->NumberValue();

  cout << "target hash : " << hash << "\n";
  cout << totalClients << " Total clients, and this one is index: " << i << "\n";

  int chunkSizes = ATTACK_SPACE / totalClients;
  cout << "This node testing from :" << chunkSizes * i << " to " << chunkSizes * i + chunkSizes <<  "\n";

  string potential_password = attack(hash, chunkSizes * i, chunkSizes * i + chunkSizes);
  result->Set(String::NewFromUtf8(isolate, "plaintextPassword"), String::NewFromUtf8(isolate, potential_password.c_str()));
  args.GetReturnValue().Set(result);
}

// tells js what the function is called
void init(Local<Object> exports) {
  NODE_SET_METHOD(exports, "crackPassword", crack_password);
}

// starter boilerplate
NODE_MODULE(NODE_GYP_MODULE_NAME, init);

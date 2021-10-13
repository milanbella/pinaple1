module.exports = {
	"env": {
		"browser": true,
		"es2021": true,
		"node": true
	},
	"rules": {
		"prefer-const": 0,
		"no-prototype-builtins": 0,
		"no-constant-condition": 0,
		"no-empty": 0,
		"no-this-alias": 0,
		"no-unused-vars": 0,
	},
	"extends": [
		"eslint:recommended"
	],
	"overrides": [
	{
		"files": ["**/*.ts", "**/*.tsx"],
		"extends": [
			"eslint:recommended",
			"plugin:@typescript-eslint/recommended"
		],
		"parser": "@typescript-eslint/parser",
		"parserOptions": {
			"ecmaVersion": 12
		},
		"plugins": [
			"@typescript-eslint"
		],
		"rules": {
			"prefer-const": 0,
			"no-prototype-builtins": 0,
			"no-constant-condition": 0,
			"no-empty": 0,
			"no-this-alias": 0,
			"no-useless-escape": 0,
			"@typescript-eslint/no-explicit-any": 0,
			"@typescript-eslint/explicit-module-boundary-types": 0,
			"@typescript-eslint/no-empty-function": 0,
			"@typescript-eslint/no-this-alias": 0,
			"@typescript-eslint/no-unused-vars": 0,
			"@typescript-eslint/no-inferrable-types": 0,
      '@typescript-eslint/no-var-requires': 0,
		}
	}]
};
